# http://flask-sqlalchemy.pocoo.org/2.1/quickstart/#a-minimal-application
# http://flask.pocoo.org/docs/0.12/patterns/sqlalchemy/
# http://docs.sqlalchemy.org/en/latest/core/type_basics.html#generic-types
# http://lucumr.pocoo.org/2011/7/19/sqlachemy-and-you/

from schedule_gate import app
from schedule_gate import db


class Settlement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(100))
    region = db.Column(db.String(200))  # Область
    district = db.Column(db.String(200))  # Район
    locality_type = db.Column(db.String(50))
    koatuu = db.Column(db.String(10)) # KOATUU code
    coordinate_lat = db.Column(db.Float)
    coordinate_lon = db.Column(db.Float)
    
    def __repr__(self):
        return '<Settlement {0}, {1}, {2}>'.format(self.name, self.district, self.region)

class Route(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.Text)
    
    def __repr__(self):
        return '<Route %r>' % self.id
        

class RouteSegment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'))
    from_sett_id = db.Column(db.Integer, db.ForeignKey('settlement.id'))
    to_sett_id = db.Column(db.Integer, db.ForeignKey('settlement.id'))
    
    route = db.relationship('Route',
                            backref=db.backref('route_segments', lazy='dynamic'))
    
    
    def __init__(self, from_settl, to_settl):
        self.from_sett_id = from_settl
        self.to_sett_id = to_settl
    
    
    def __repr__(self):
        return '<RouteSegment {}>'.format(self.id)


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'))
    departure_time = db.Column(db.DateTime)
    arrival_time = db.Column(db.DateTime)
    week_schedule = db.Column(db.SmallInteger)
    
    route = db.relationship('Route',
                           backref=db.backref('schedules', lazy='dynamic'))
                           
    def __init__(self, departure_time, arrival_time):
        self.departure_time = departure_time
        self.arrival_time = arrival_time
    
    def __repr__(self):
        return '<Schedule {}>'.format(self.id)
