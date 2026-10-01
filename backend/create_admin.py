#!/usr/bin/env python3
"""
Script to create an admin user for the inventory prediction system
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.database import db
from models.user import User

def create_sample_users():
    """Create sample users for testing"""
    try:
        db.connect()
        print("✅ Connected to MongoDB")
        
        sample_users = [
            {
                'email': 'admin@spareparts.com',
                'password': 'admin123',
                'role': 'admin',
                'name': 'System Administrator'
            },
            {
                'email': 'staff@spareparts.com',
                'password': 'staff123',
                'role': 'staff',
                'name': 'Staff User'
            }
        ]
        
        print("\n📝 Creating Sample Users")
        print("-" * 30)
        
        for user_data in sample_users:
            try:
                user = User(
                    email=user_data['email'],
                    password=user_data['password'],
                    role=user_data['role'],
                    name=user_data['name']
                )
                user_id = user.save()
                print(f"✅ Created {user_data['role']}: {user_data['email']}")
            except ValueError:
                print(f"⚠️  User already exists: {user_data['email']}")
        
        print(f"\n🚀 Sample users created! You can login with:")
        print(f"   Admin: admin@spareparts.com / admin123")
        print(f"   Staff: staff@spareparts.com / staff123")
        
    except Exception as e:
        print(f"❌ Failed to create sample users: {str(e)}")
    finally:
        db.close_connection()

if __name__ == '__main__':
    print("🔧 Spare Parts Inventory - User Management")
    print("=" * 50)
    create_sample_users()