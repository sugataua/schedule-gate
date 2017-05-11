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

        
