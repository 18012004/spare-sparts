from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
import re
from datetime import timedelta
import os

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate input
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Authenticate user
        user = User.authenticate(email, password)
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Update last login
        User.update_last_login(user['id'])
        
        # Create access token
        expires = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
        access_token = create_access_token(
            identity=user['id'],
            expires_delta=expires
        )
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = data.get('role', 'staff')
        name = data.get('name', '')
        
        # Validate input
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        is_valid, password_message = validate_password(password)
        if not is_valid:
            return jsonify({'message': password_message}), 400
        
        if role not in ['admin', 'staff']:
            return jsonify({'message': 'Invalid role. Must be admin or staff'}), 400
        
        # Create new user
        try:
            user = User(email=email, password=password, role=role, name=name)
            user_id = user.save()
            
            # Create access token
            expires = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
            access_token = create_access_token(
                identity=user_id,
                expires_delta=expires
            )
            
            return jsonify({
                'message': 'User created successfully',
                'token': access_token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'role': role,
                    'name': name
                }
            }), 201
            
        except ValueError as e:
            return jsonify({'message': str(e)}), 409
        
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token and return user info"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Token verification failed: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'name': user['name'],
                'created_at': user['created_at'].isoformat(),
                'updated_at': user['updated_at'].isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get profile: {str(e)}'}), 500

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.find_by_id(current_user_id)
        
        if not current_user or current_user['role'] != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        users = User.get_all_users()
        return jsonify({'users': users}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get users: {str(e)}'}), 500