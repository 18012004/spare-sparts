from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import os
import logging
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
# from models.database import db
# from routes.auth import auth_bp
from config import Config
from model_loader import ModelLoader
from predictor import InventoryPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))

# Global variables for ML model
model_loader = ModelLoader()
predictor = None

def initialize_app():
    """Initialize the application with model and predictor"""
    global predictor
    
    try:
        # Skip database connection for now
        logger.info("⚠️ Running without database connection")
        
        # Load ML model and scaler
        model_loaded = model_loader.load_model()
        scaler_loaded = model_loader.load_scaler()
        
        if model_loaded and scaler_loaded:
            predictor = InventoryPredictor(
                model_loader.get_model(),
                model_loader.get_scaler(),
                model_loader.device
            )
            logger.info("✅ ML model initialized successfully")
            return True
        else:
            logger.warning("⚠️ ML model not loaded, continuing without predictions")
            return True
            
    except Exception as e:
        logger.error(f"❌ Failed to initialize application: {str(e)}")
        return False

# Register blueprints
# app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'database_connected': False,  # Running without database
            'model_loaded': model_loader.model is not None,
            'scaler_loaded': model_loader.scaler is not None,
            'predictor_ready': predictor is not None
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Model info endpoint
@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_type': 'LSTM',
        'input_size': Config.INPUT_SIZE,
        'hidden_size': Config.HIDDEN_SIZE,
        'num_layers': Config.NUM_LAYERS,
        'sequence_length': Config.SEQUENCE_LENGTH,
        'framework': 'PyTorch',
        'device': str(model_loader.device),
        'model_loaded': model_loader.model is not None,
        'scaler_loaded': model_loader.scaler is not None,
        'predictor_ready': predictor is not None
    })

# Prediction endpoints (no authentication for now)
@app.route('/predict-single', methods=['POST'])
def predict_single():
    """Make a single prediction"""
    try:
        if predictor is None:
            return jsonify({'error': 'Predictor not initialized'}), 500
        
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        # Make single prediction
        prediction = predictor.predict_single(historical_data)
        
        return jsonify({
            'prediction': prediction,
            'model_type': 'LSTM',
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_demand():
    """Predict inventory demand"""
    try:
        if predictor is None:
            return jsonify({'error': 'Predictor not initialized'}), 500
        
        data = request.get_json()
        
        # Extract parameters
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < Config.MIN_HISTORICAL_DATA_POINTS:
            return jsonify({
                'error': f'Insufficient historical data (minimum {Config.MIN_HISTORICAL_DATA_POINTS} points required)'
            }), 400
        
        # Make predictions
        predictions = predictor.predict_multiple(historical_data, prediction_days)
        
        return jsonify({
            'predictions': predictions,
            'prediction_days': prediction_days,
            'model_type': 'LSTM',
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict-weekly', methods=['POST'])
def predict_weekly_demand():
    """Predict weekly inventory demand"""
    try:
        if predictor is None:
            return jsonify({'error': 'Predictor not initialized'}), 500
        
        data = request.get_json()
        
        # Extract parameters
        historical_data = data.get('historical_data', [])
        weeks_ahead = data.get('weeks_ahead', Config.DEFAULT_WEEKS_AHEAD)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        # Make weekly predictions
        weekly_predictions = predictor.predict_weekly(historical_data, weeks_ahead)
        
        return jsonify({
            'weekly_predictions': weekly_predictions,
            'weeks_ahead': weeks_ahead,
            'model_type': 'LSTM',
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-trends', methods=['POST'])
def analyze_trends():
    """Analyze trends in historical data"""
    try:
        if predictor is None:
            return jsonify({'error': 'Predictor not initialized'}), 500
        
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        
        if not historical_data or len(historical_data) < 7:
            return jsonify({'error': 'Insufficient historical data (minimum 7 points required)'}), 400
        
        # Analyze trends
        trend_analysis = predictor.analyze_trends(historical_data)
        trend_analysis['status'] = 'success'
        
        return jsonify(trend_analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'message': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'message': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'message': 'Authorization token is required'}), 401

if __name__ == '__main__':
    # Initialize application
    if initialize_app():
        logger.info("🚀 Starting Flask API server...")
        app.run(
            debug=os.getenv('DEBUG', 'True').lower() == 'true',
            host=os.getenv('HOST', '0.0.0.0'),
            port=int(os.getenv('PORT', 5001))
        )
    else:
        logger.error("❌ Failed to initialize application. Please check configuration.")