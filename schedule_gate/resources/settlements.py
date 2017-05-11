from flask import abort
from flask_restful import Resource
from schedule_gate.model import Settlement
#from schedule import db

class SettlementSingle(Resource):
    
    def get(self, settl_id):
        settl = Settlement.query.get_or_404(settl_id)
        settl_dict = dict(settl.__dict__)
        settl_dict.pop('_sa_instance_state', None)
        
        return settl_dict
        
        
class SettlementList(Resource):
    def get(self):
        list = Settlement.query.limit(10).all()
    
class SettlementSearch(Resource):
    def get(self, search_term):        
        sttl_found = Settlement.query \
                               .filter(Settlement.name.like(search_term.upper() +'%')) \
                               .order_by(Settlement.name) \
                               .limit(10) \
                               .all()
                               
        if not sttl_found:
            print("No results found")
            abort(404)
        resp = []
        for s in sttl_found:
            sttl_d = dict(s.__dict__)
            sttl_d.pop('_sa_instance_state', None)
            resp.append(sttl_d)
        
        return resp