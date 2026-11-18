from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
# 🎯 1. Ajoute cette importation :
from flask_jwt_extended import JWTManager 

from .config import Config

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
# 🎯 2. Initialise l'objet JWT :
jwt = JWTManager() 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    mail.init_app(app)
    
    # 🎯 3. Connecte le JWT à ton application Flask :
    jwt.init_app(app)

    from .routes.auth import auth_bp
    from .routes.transactions import transactions_bp
    from .routes.budgets import budgets_bp
    from .routes.comptes import comptes_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(comptes_bp, url_prefix='/api/comptes')

    return app