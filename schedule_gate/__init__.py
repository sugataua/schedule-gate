import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
import click



basedir = os.path.abspath(os.path.dirname(__file__))


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir,'flask_alchemy.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
api = Api(app)


from schedule_gate.resources.settlements import SettlementSingle, SettlementSearch
from schedule_gate.resources.routes import SingleRoute, ListRoute, RouteSearch, RouteSearch2

api.add_resource(SettlementSingle, '/<int:settl_id>')
api.add_resource(SettlementSearch,'/search/<search_term>')

api.add_resource(SingleRoute,'/routes/<int:route_id>')
api.add_resource(ListRoute,'/routes')
api.add_resource(RouteSearch,'/routes/search/<int:settl_id>')
api.add_resource(RouteSearch2,'/routes/search2')



"""
def create_app(config=None):
    app = Flask(__name__)
    
    if config is not None:
        app.config.from_object(config)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir,'flask_alchemy.db')
    
    api.add_resource(SingleSettlement, '/')
    
    db.init_app(app)
    api.init_app(app)
    
    db.create_all(app=app)
        
    return app
"""    
    
#app = create_app()



@app.cli.command()
def initdb():
    """Initialize the database"""
    click.echo(" ")
    click.echo("Attempt to init db")    
    db.create_all()
    click.echo("Database created!")
    
    
@app.route("/")
def test():
    return render_template('main.html')
    
@app.route("/add")
def add_route():
    return render_template('add_route2.html')