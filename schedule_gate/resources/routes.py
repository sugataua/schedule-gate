from datetime import datetime
from flask import request, abort
from flask_restful import Resource, reqparse
from schedule_gate import db
from schedule_gate.model import Route, RouteSegment, Settlement, Schedule

TIME_FORMAT = "%H:%M"

def getSettlement(settl_id):
    settl = Settlement.query.get(settl_id)
    settl_dict = dict(settl.__dict__)
    settl_dict.pop('_sa_instance_state', None)
    return settl_dict

def find_path(graph, start, end, path = []):
    path = path + [start]
    print(path)
    if start == end:
        return path
    if not start in graph:
        return None
    next_start = graph[start]
    result_path = find_path(graph, next_start, end, path)
    if result_path: return result_path
    return None
    

def create_graph_segments(path):
    segments = [(path[i],path[i+1]) for i in range(len(path)-1)]
    return segments
    
    
def filter_route(route_id, from_id, to_id):
    route = Route.query.get_or_404(route_id)
    route_segments = route.route_segments.all()
    
    settls_from = {segm.from_sett_id for segm in route_segments}
    settls_to = {segm.to_sett_id for segm in route_segments}
    graph_tuple = [(segm.from_sett_id, segm.to_sett_id) for segm in route_segments]
    graph = dict(graph_tuple)
            
    start = settls_from - settls_to
    end = settls_to - settls_from
            
    if (len(start) > 1):
        abort(500)
        
    if (len(end) > 1):
        abort(500)
                    
    path = find_path(graph, from_id, to_id)
    
    result = False
    
    if path is None:
        result = False
    else:
        result = True
    
    return result


parser = reqparse.RequestParser()
parser.add_argument('path', type=list, help='Route path')

parser_route_search = reqparse.RequestParser()
parser_route_search.add_argument('fcode', type=int, help='From settlement')
parser_route_search.add_argument('tcode', type=int, help='To settlement')


class SingleRoute(Resource):

    def get(self, route_id):
        route = Route.query.get_or_404(route_id)
        route_segments = route.route_segments.all()
        
        settls_from = {segm.from_sett_id for segm in route_segments}
        settls_to = {segm.to_sett_id for segm in route_segments}
        graph_tuple = [(segm.from_sett_id, segm.to_sett_id) for segm in route_segments]
        graph = dict(graph_tuple)
                
        start = settls_from - settls_to
        end = settls_to - settls_from
                
        if (len(start) > 1):
            abort(500)

        if (len(end) > 1):
            abort(500)

                        
        start_id = list(start)[0]
        end_id = list(end)[0]
        
        path = find_path(graph, start_id, end_id)
        
        path_settlements = []
        for point_id in path:
            settl = getSettlement(point_id)
            path_settlements.append(settl)
                
        #start_settl = Settlement.query.get(start_id)
        #end_settl = Settlement.query.get(end_id)
        
        schedule_list = []
        for sched in route.schedules:
            sched_dict = dict(sched.__dict__)
            sched_dict['departure_time'] =  sched_dict['departure_time'].strftime(TIME_FORMAT)
            sched_dict['arrival_time'] = sched_dict['arrival_time'].strftime(TIME_FORMAT)
            sched_dict.pop('_sa_instance_state', None)
            schedule_list.append(sched_dict)
                
        return dict(path=path_settlements, id=route.id, comment=route.comment, schedules=schedule_list)
    

class ListRoute(Resource):
    def post(self):
        
        path = request.json['path']
        schedules = request.json['schedules']
        print(path)
        print(schedules)
        if not (path and schedules):
            abort(400)
        segments = create_graph_segments(path)
        print(segments)
        
        route = Route()
        for segm in segments:
            rs = RouteSegment(segm[0], segm[1])
            route.route_segments.append(rs)
            
        for sched in schedules:
            sc = Schedule(datetime.strptime(sched['departure_time'], TIME_FORMAT), \
            datetime.strptime(sched['arrival_time'], TIME_FORMAT))            
            route.schedules.append(sc)
        db.session.add(route)
        db.session.commit()
        
        singleRoute = SingleRoute()
        route_saved = singleRoute.get(route.id)
            
        return route_saved , 201
        
class RouteSearch(Resource):
    def get(self, settl_id):
        settl = Settlement.query.get_or_404(settl_id)
        routes_from = db.session.query(RouteSegment.route_id).filter(RouteSegment.from_sett_id == settl_id).distinct().all()
        routes_to = db.session.query(RouteSegment.route_id).filter(RouteSegment.to_sett_id == settl_id).distinct().all()
        
        from_set = set()
        to_set = set()
        
        for (value,) in routes_from:
            from_set.add(value)
        
        for (value,) in routes_to:
            to_set.add(value)
            
        routes_id = list(from_set | to_set)
        
        if not routes_id:
            abort(404)
        
        routes = []        
        
        for route_id in routes_id:
            routeResource = SingleRoute()
            r = routeResource.get(route_id)
            routes.append(r)        
                        
        return dict(routes=routes)
        
class RouteSearch2(Resource):
    def get(self):
        args = parser_route_search.parse_args()
        
        print('fcode', args['fcode'])
        print('tcode', args['tcode'])
        
        settl_from = Settlement.query.filter(Settlement.koatuu == args['fcode']).first()
        settl_to = Settlement.query.filter(Settlement.koatuu == args['tcode']).first()
        
        if not settl_from or not settl_to:
            abort(404)
        
        
        routes_from = db.session.query(RouteSegment.route_id).filter(RouteSegment.from_sett_id == settl_from.id).distinct().all()
        routes_to = db.session.query(RouteSegment.route_id).filter(RouteSegment.to_sett_id == settl_to.id).distinct().all()
        
        from_set = set()
        to_set = set()
        
        for (value,) in routes_from:
            from_set.add(value)
        
        for (value,) in routes_to:
            to_set.add(value)
            
        routes_id = list(from_set | to_set)
        
        if not routes_id:
            abort(404)
        
        routes = []        
        
        for route_id in routes_id:
            if filter_route(route_id, settl_from.id, settl_to.id):
                routeResource = SingleRoute()
                r = routeResource.get(route_id)
                routes.append(r)                
                        
        return dict(routes=routes)
        


    
        