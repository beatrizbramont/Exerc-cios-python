from flask import Flask
from models.model import db
from config import Config
from routes.categorias_routes import categorias_bp
from routes.despesas_routes import despesas_bp
from routes.frontend_routes import frontend_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()
    
    CORS(app)

    app.register_blueprint(despesas_bp, url_prefix="/despesas")
    app.register_blueprint(categorias_bp, url_prefix="/categorias")
    app.register_blueprint(frontend_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=8001)
