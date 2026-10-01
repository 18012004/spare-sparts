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

def create_admin_user():
    """Create an admin user"""
    try:
        # Connect to database
        db.connect()
        print("✅ Connected to MongoDB")
        
        # Get admin details
        print("\n📝 Creating Admin User")
        print("-" * 30)
        
        email = input("Enter admin email: ").strip().lower()
        if not email:
            print("❌ Email is required")
            return
        
        password = input("Enter admin password: ").strip()
        if not password:
            print("❌ Password is required")
            return
        
        name = input("Enter admin name (optional): ").strip()
        if not name:
            name = email.split('@')[0]
        
        # Create admin user
        admin_user = User(email=email, password=password, role='admin', name=name)
        user_id = admin_user.save()
        
        print(f"\n✅ Admin user created successfully!")
        print(f"   ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Role: admin")
        
        print(f"\n🚀 You can now login to the application with:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        
    except ValueError as e:
        print(f"❌ Error: {str(e)}")
    except Exception as e:
        print(f"❌ Failed to create admin user: {str(e)}")
    finally:
        db.close_connection()

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
    
    choice = input("\nChoose an option:\n1. Create custom admin user\n2. Create sample users\nEnter choice (1 or 2): ").strip()
    
    if choice == '1':
        create_admin_user()
    elif choice == '2':
        create_sample_users()
    else:
        print("❌ Invalid choice. Please run the script again.")