# Configuration settings for the Flask application
import os
from typing import Type
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_default_secret_key'
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1']
    TESTING = os.environ.get('TESTING', 'False').lower() in ['true', '1']
    
    # Priority: POSTGREE_DATABASE_URL (Supabase) -> DATABASE_URI -> default fallback
    _raw_db_url = os.environ.get('POSTGREE_DATABASE_URL') or os.environ.get('DATABASE_URI') or 'sqlite:///default.db'
    
    # SQLAlchemy 2.0 compatibility: replace postgres:// with postgresql:// if present
    if _raw_db_url.startswith('postgres://'):
        _raw_db_url = _raw_db_url.replace('postgres://', 'postgresql://', 1)
        
    DATABASE_URI = _raw_db_url
    SQLALCHEMY_DATABASE_URI = _raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


class FactoryConfig:
    """Factory to get configuration based on environment."""
    @staticmethod
    def get_config(env: str) -> Type[Config]:
        env_lower = (env or '').lower()
        if env_lower == 'development':
            return DevelopmentConfig
        elif env_lower == 'testing':
            return TestingConfig
        elif env_lower == 'production':
            return ProductionConfig
        else:
            return DevelopmentConfig


class SwaggerConfig:
    """Swagger documentation configuration."""
    template = {
        "swagger": "2.0",
        "info": {
            "title": "AR-IMMS Backend API",
            "description": "API for AR-Integrated Infrastructure Monitoring and Maintenance System",
            "version": "1.0.0"
        },
        "basePath": "/",
        "schemes": [
            "http",
            "https"
        ],
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ]
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    }