from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import os
import logging
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from models.database import db
from routes.auth import auth_bp
from config import Config
from arima_predictor import ARIMAPredictor, SARIMAPredictor, HoltWintersPredictor, EnsemblePredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable caching for development

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','), supports_credentials=True)

# Global variables
arima_predictor = ARIMAPredictor()
sarima_predictor = SARIMAPredictor()
holt_winters_predictor = HoltWintersPredictor()
ensemble_predictor = None

def initialize_app():
    """Initialize the application with ARIMA and SARIMA models"""
    global ensemble_predictor
    
    db_connected = False
    
    # Try to initialize database connection
    try:
        db.connect()
        logger.info("✅ Database connected successfully")
        db_connected = True
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed: {str(e)[:200]}")
        logger.warning("⚠️ Continuing without database - authentication will not work")
    
    # Initialize ensemble predictor (ARIMA + SARIMA + Holt-Winters)
    try:
        ensemble_predictor = EnsemblePredictor(lstm_predictor=None)
        logger.info("✅ Ensemble predictor (ARIMA + SARIMA + Holt-Winters) initialized")
    except Exception as e:
        logger.warning(f"⚠️ Ensemble predictor initialization failed: {str(e)[:200]}")
    
    # All models are always available (no pre-training needed)
    logger.info("✅ ARIMA, SARIMA, and Holt-Winters models ready for forecasting")
    
    return True

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db_status = True
        db_error = None
        try:
            db.get_db().command('ping')
        except Exception as e:
            db_status = False
            db_error = str(e)
        
        return jsonify({
            'status': 'healthy',
            'database_connected': db_status,
            'database_error': db_error,
            'arima_available': True,
            'sarima_available': True,
            'holt_winters_available': True,
            'ensemble_ready': ensemble_predictor is not None
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users - alternative endpoint"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        users_collection = db.get_collection('users')
        current_user = users_collection.find_one({'_id': ObjectId(current_user_id)})
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get all users
        users = []
        for user_data in users_collection.find({}, {'password': 0}):
            users.append({
                'id': str(user_data['_id']),
                'email': user_data.get('email', ''),
                'role': user_data.get('role', 'staff'),
                'name': user_data.get('name', ''),
                'created_at': user_data.get('created_at').isoformat() if user_data.get('created_at') else None,
                'last_login': user_data.get('last_login').isoformat() if user_data.get('last_login') else None
            })
        
        return jsonify({
            'users': users,
            'total': len(users)
        }), 200
        
    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        return jsonify({'error': str(e), 'details': 'Check if MongoDB is connected'}), 500

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict_demand():
    """Predict inventory demand using ensemble (ARIMA + SARIMA + Holt-Winters)"""
    try:
        if ensemble_predictor is None:
            return jsonify({'error': 'Ensemble predictor not initialized'}), 500
        
        data = request.get_json()
        
        # Extract parameters
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < 10:
            return jsonify({'error': 'Minimum 10 data points required'}), 400
        
        # Limit maximum prediction to avoid timeout (max 365 days = 1 year)
        if prediction_days > 365:
            return jsonify({'error': 'Maximum prediction period is 365 days (12 months)'}), 400
        
        # For long-term predictions (>90 days), use faster model
        if prediction_days > 90:
            logger.info(f"Long-term prediction requested: {prediction_days} days. Using Holt-Winters for speed.")
            hw = HoltWintersPredictor()
            hw.fit(historical_data)
            predictions = hw.predict(steps=prediction_days)
            
            return jsonify({
                'predictions': predictions,
                'prediction_days': prediction_days,
                'model_type': 'Holt-Winters (optimized for long-term)',
                'models_used': ['holt_winters'],
                'status': 'success',
                'note': 'Using Holt-Winters for faster long-term predictions'
            })
        
        # Make ensemble predictions for short/medium term
        result = ensemble_predictor.predict(historical_data, steps=prediction_days)
        
        return jsonify({
            'predictions': result['ensemble_predictions'],
            'prediction_days': prediction_days,
            'model_type': 'Ensemble (ARIMA + SARIMA + Holt-Winters)',
            'models_used': result['models_used'],
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about all available models"""
    return jsonify({
        'arima': {
            'available': True,
            'description': 'AutoRegressive Integrated Moving Average',
            'type': 'Statistical Time Series Model',
            'best_for': 'Linear trends, short-term forecasting',
            'auto_tuning': True,
            'min_data_points': 10
        },
        'sarima': {
            'available': True,
            'description': 'Seasonal ARIMA',
            'type': 'Statistical Time Series Model with Seasonality',
            'best_for': 'Seasonal patterns, weekly/monthly cycles',
            'default_period': 7,
            'auto_tuning': True,
            'min_data_points': 14
        },
        'holt_winters': {
            'available': True,
            'description': 'Exponential Smoothing (Triple)',
            'type': 'Statistical Smoothing Model',
            'best_for': 'Trend and seasonality, fast predictions',
            'default_period': 7,
            'min_data_points': 10
        },
        'ensemble': {
            'available': ensemble_predictor is not None,
            'description': 'Combined ARIMA + SARIMA + Holt-Winters',
            'type': 'Hybrid Statistical Model',
            'weights': {'arima': 0.33, 'sarima': 0.33, 'holt_winters': 0.34},
            'best_for': 'Most accurate predictions',
            'min_data_points': 14
        }
    })

@app.route('/predict-single', methods=['POST'])
@jwt_required()
def predict_single():
    """Make a single prediction using ARIMA"""
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < 10:
            return jsonify({'error': 'Minimum 10 data points required'}), 400
        
        # Use ARIMA for single prediction
        arima = ARIMAPredictor()
        arima.fit(historical_data)
        predictions = arima.predict(steps=1)
        
        return jsonify({
            'prediction': predictions[0],
            'model_type': 'ARIMA',
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict-arima', methods=['POST'])
@jwt_required()
def predict_arima():
    """Make predictions using ARIMA model"""
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        with_intervals = data.get('with_intervals', False)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < 10:
            return jsonify({'error': 'Minimum 10 data points required for ARIMA'}), 400
        
        # Limit maximum prediction
        if prediction_days > 365:
            return jsonify({'error': 'Maximum prediction period is 365 days'}), 400
        
        # Fit and predict
        arima = ARIMAPredictor()
        arima.fit(historical_data)
        
        if with_intervals:
            predictions = arima.predict_with_intervals(steps=prediction_days)
        else:
            pred_values = arima.predict(steps=prediction_days)
            predictions = pred_values
        
        model_summary = arima.get_model_summary()
        
        return jsonify({
            'predictions': predictions,
            'prediction_days': prediction_days,
            'model_type': 'ARIMA',
            'model_summary': model_summary,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"ARIMA prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict-sarima', methods=['POST'])
@jwt_required()
def predict_sarima():
    """Make predictions using SARIMA model"""
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        with_intervals = data.get('with_intervals', False)
        seasonal_period = data.get('seasonal_period', 7)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < seasonal_period * 2:
            return jsonify({'error': f'Minimum {seasonal_period * 2} data points required for SARIMA'}), 400
        
        # Limit maximum prediction (SARIMA is slow for long-term)
        if prediction_days > 180:
            return jsonify({'error': 'Maximum prediction period for SARIMA is 180 days. Use Holt-Winters for longer predictions.'}), 400
        
        # Fit and predict
        sarima = SARIMAPredictor(seasonal_period=seasonal_period)
        sarima.fit(historical_data)
        
        if with_intervals:
            predictions = sarima.predict_with_intervals(steps=prediction_days)
        else:
            pred_values = sarima.predict(steps=prediction_days)
            predictions = pred_values
        
        model_summary = sarima.get_model_summary()
        
        return jsonify({
            'predictions': predictions,
            'prediction_days': prediction_days,
            'model_type': 'SARIMA',
            'model_summary': model_summary,
            'seasonal_period': seasonal_period,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"SARIMA prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict-holt-winters', methods=['POST'])
@jwt_required()
def predict_holt_winters():
    """Make predictions using Holt-Winters Exponential Smoothing"""
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        with_intervals = data.get('with_intervals', False)
        seasonal_period = data.get('seasonal_period', 7)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < 10:
            return jsonify({'error': 'Minimum 10 data points required for Holt-Winters'}), 400
        
        # Fit and predict
        hw = HoltWintersPredictor(seasonal_period=seasonal_period)
        hw.fit(historical_data)
        
        if with_intervals:
            predictions = hw.predict_with_intervals(steps=prediction_days)
        else:
            pred_values = hw.predict(steps=prediction_days)
            predictions = pred_values
        
        model_summary = hw.get_model_summary()
        
        return jsonify({
            'predictions': predictions,
            'prediction_days': prediction_days,
            'model_type': 'Holt-Winters',
            'model_summary': model_summary,
            'seasonal_period': seasonal_period,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict-ensemble', methods=['POST'])
@jwt_required()
def predict_ensemble():
    """Make predictions using ensemble of ARIMA, SARIMA, and Holt-Winters"""
    try:
        if ensemble_predictor is None:
            return jsonify({'error': 'Ensemble predictor not initialized'}), 500
        
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        prediction_days = data.get('prediction_days', Config.DEFAULT_PREDICTION_DAYS)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < 14:
            return jsonify({'error': 'Minimum 14 data points required for ensemble'}), 400
        
        # Make ensemble predictions
        result = ensemble_predictor.predict(historical_data, steps=prediction_days)
        
        return jsonify({
            'ensemble_predictions': result['ensemble_predictions'],
            'individual_predictions': result['individual_predictions'],
            'models_used': result['models_used'],
            'prediction_days': prediction_days,
            'model_type': 'Ensemble (ARIMA + SARIMA + Holt-Winters)',
            'weights': {'arima': '33%', 'sarima': '33%', 'holt_winters': '34%'},
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/compare-models', methods=['POST'])
@jwt_required()
def compare_models():
    """Compare performance of ARIMA, SARIMA, and LSTM models"""
    try:
        if ensemble_predictor is None:
            return jsonify({'error': 'Ensemble predictor not initialized'}), 500
        
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        test_size = data.get('test_size', 7)
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        if len(historical_data) < test_size + 14:
            return jsonify({'error': f'Minimum {test_size + 14} data points required for comparison'}), 400
        
        # Compare models
        comparison = ensemble_predictor.compare_models(historical_data, test_size)
        
        return jsonify({
            'comparison': comparison,
            'test_size': test_size,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-stationarity', methods=['POST'])
@jwt_required()
def check_stationarity():
    """Check if time series is stationary (for ARIMA analysis)"""
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        
        if not historical_data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        arima = ARIMAPredictor()
        stationarity_result = arima.check_stationarity(historical_data)
        
        return jsonify({
            'stationarity': stationarity_result,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/purchase-requests', methods=['POST'])
@jwt_required()
def create_purchase_request():
    """Create a purchase request (Staff triggers, Admin approves)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = db.get_collection('users').find_one({'_id': ObjectId(current_user_id)})
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        part_name = data.get('part_name')
        quantity = data.get('quantity')
        reason = data.get('reason', 'High demand predicted')
        
        if not part_name or not quantity:
            return jsonify({'error': 'Part name and quantity are required'}), 400
        
        # Create purchase request
        purchase_request = {
            'part_name': part_name,
            'quantity': quantity,
            'reason': reason,
            'requested_by': {
                'id': str(current_user['_id']),
                'name': current_user.get('name', current_user['email']),
                'email': current_user['email'],
                'role': current_user['role']
            },
            'status': 'pending',  # pending, approved, rejected
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.get_collection('purchase_requests').insert_one(purchase_request)
        
        return jsonify({
            'message': 'Purchase request created successfully',
            'request_id': str(result.inserted_id),
            'status': 'pending',
            'note': 'Request sent to admin for approval'
        }), 201
        
    except Exception as e:
        logger.error(f"Purchase request error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/purchase-requests', methods=['GET'])
@jwt_required()
def get_purchase_requests():
    """Get purchase requests (Staff sees their own, Admin sees all)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = db.get_collection('users').find_one({'_id': ObjectId(current_user_id)})
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        requests_collection = db.get_collection('purchase_requests')
        
        # Admin sees all requests, Staff sees only their own
        if current_user['role'] == 'admin':
            query = {}
        else:
            query = {'requested_by.id': str(current_user['_id'])}
        
        requests = []
        for req in requests_collection.find(query).sort('created_at', -1):
            requests.append({
                'id': str(req['_id']),
                'part_name': req['part_name'],
                'quantity': req['quantity'],
                'reason': req['reason'],
                'requested_by': req['requested_by'],
                'status': req['status'],
                'created_at': req['created_at'].isoformat(),
                'updated_at': req['updated_at'].isoformat(),
                'approved_by': req.get('approved_by'),
                'approved_at': req.get('approved_at').isoformat() if req.get('approved_at') else None
            })
        
        return jsonify({
            'requests': requests,
            'total': len(requests)
        }), 200
        
    except Exception as e:
        logger.error(f"Get purchase requests error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/purchase-requests/<request_id>/approve', methods=['POST'])
@jwt_required()
def approve_purchase_request(request_id):
    """Approve a purchase request (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = db.get_collection('users').find_one({'_id': ObjectId(current_user_id)})
        
        if not current_user or current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        requests_collection = db.get_collection('purchase_requests')
        
        result = requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'approved',
                    'approved_by': {
                        'id': str(current_user['_id']),
                        'name': current_user.get('name', current_user['email']),
                        'email': current_user['email']
                    },
                    'approved_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Purchase request not found'}), 404
        
        return jsonify({
            'message': 'Purchase request approved successfully',
            'status': 'approved'
        }), 200
        
    except Exception as e:
        logger.error(f"Approve purchase request error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/purchase-requests/<request_id>/reject', methods=['POST'])
@jwt_required()
def reject_purchase_request(request_id):
    """Reject a purchase request (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = db.get_collection('users').find_one({'_id': ObjectId(current_user_id)})
        
        if not current_user or current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        rejection_reason = data.get('reason', 'No reason provided')
        
        requests_collection = db.get_collection('purchase_requests')
        
        result = requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'rejected',
                    'rejected_by': {
                        'id': str(current_user['_id']),
                        'name': current_user.get('name', current_user['email']),
                        'email': current_user['email']
                    },
                    'rejection_reason': rejection_reason,
                    'rejected_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Purchase request not found'}), 404
        
        return jsonify({
            'message': 'Purchase request rejected',
            'status': 'rejected'
        }), 200
        
    except Exception as e:
        logger.error(f"Reject purchase request error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-db', methods=['GET'])
def test_database():
    """Test database connection and show stats"""
    try:
        # Test connection
        db.get_db().command('ping')
        
        # Get collection stats
        users_collection = db.get_collection('users')
        user_count = users_collection.count_documents({})
        
        requests_collection = db.get_collection('purchase_requests')
        request_count = requests_collection.count_documents({})
        
        return jsonify({
            'status': 'connected',
            'database': os.getenv('DATABASE_NAME', 'spare-parts-db'),
            'collections': {
                'users': user_count,
                'purchase_requests': request_count
            },
            'message': 'Database is working correctly'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'message': 'Database connection failed'
        }), 500

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