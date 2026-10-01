from datetime import datetime
from bson import ObjectId
import bcrypt
from models.database import db

class User:
    def __init__(self, email, password, role='staff', name=None):
        self.email = email
        self.password = password
        self.role = role
        self.name = name or email.split('@')[0]
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @staticmethod
    def hash_password(password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    @staticmethod
    def check_password(password, hashed_password):
        """Check if password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
    
    def save(self):
        """Save user to database"""
        users_collection = db.get_collection('users')
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': self.email})
        if existing_user:
            raise ValueError('User with this email already exists')
        
        # Hash password before saving
        hashed_password = self.hash_password(self.password)
        
        user_data = {
            'email': self.email,
            'password': hashed_password,
            'role': self.role,
            'name': self.name,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        result = users_collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        users_collection = db.get_collection('users')
        user_data = users_collection.find_one({'email': email})
        
        if user_data:
            return {
                'id': str(user_data['_id']),
                'email': user_data['email'],
                'password': user_data['password'],
                'role': user_data['role'],
                'name': user_data['name'],
                'created_at': user_data['created_at'],
                'updated_at': user_data['updated_at']
            }
        return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        users_collection = db.get_collection('users')
        try:
            user_data = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if user_data:
                return {
                    'id': str(user_data['_id']),
                    'email': user_data['email'],
                    'role': user_data['role'],
                    'name': user_data['name'],
                    'created_at': user_data['created_at'],
                    'updated_at': user_data['updated_at']
                }
        except Exception:
            pass
        return None
    
    @staticmethod
    def authenticate(email, password):
        """Authenticate user with email and password"""
        user = User.find_by_email(email)
        if user and User.check_password(password, user['password']):
            # Remove password from returned user data
            user.pop('password', None)
            return user
        return None
    
    @staticmethod
    def update_last_login(user_id):
        """Update user's last login time"""
        users_collection = db.get_collection('users')
        try:
            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'last_login': datetime.utcnow(), 'updated_at': datetime.utcnow()}}
            )
        except Exception as e:
            print(f"Error updating last login: {str(e)}")
    
    @staticmethod
    def get_all_users():
        """Get all users (admin only)"""
        users_collection = db.get_collection('users')
        users = []
        
        for user_data in users_collection.find({}, {'password': 0}):  # Exclude password
            users.append({
                'id': str(user_data['_id']),
                'email': user_data.get('email', ''),
                'role': user_data.get('role', 'staff'),
                'name': user_data.get('name', ''),
                'created_at': user_data.get('created_at').isoformat() if user_data.get('created_at') else None,
                'updated_at': user_data.get('updated_at').isoformat() if user_data.get('updated_at') else None,
                'last_login': user_data.get('last_login').isoformat() if user_data.get('last_login') else None
            })
        
        return users