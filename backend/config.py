import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Model configuration
    MODEL_PATH = os.getenv('MODEL_PATH', 'models/model_weights.pth')
    
    # LSTM Model parameters
    INPUT_SIZE = 1
    HIDDEN_SIZE = 64
    NUM_LAYERS = 2
    OUTPUT_SIZE = 1
    SEQUENCE_LENGTH = 14
    
    # API configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5001))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Data configuration
    CSV_PATH = os.getenv('CSV_PATH', '../inventory.csv')
    
    # Prediction defaults
    DEFAULT_PREDICTION_DAYS = int(os.getenv('DEFAULT_PREDICTION_DAYS', 7))
    DEFAULT_WEEKS_AHEAD = int(os.getenv('DEFAULT_WEEKS_AHEAD', 4))
    MIN_HISTORICAL_DATA_POINTS = 14
    
    # MongoDB configuration
    MONGODB_URI = os.getenv('MONGODB_URI')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'spare-parts-db')
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))