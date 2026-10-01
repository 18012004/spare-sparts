#!/usr/bin/env python3
"""
Startup script for the Flask backend with MongoDB authentication
"""

import os
import sys
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_requirements():
    """Check if all required packages are installed"""
    required_packages = [
        'flask', 'flask-cors', 'flask-jwt-extended', 
        'pymongo', 'torch', 'pandas', 'numpy', 
        'scikit-learn', 'python-dotenv', 'bcrypt'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install missing packages with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_environment():
    """Check if environment variables are set"""
    required_env_vars = [
        'MONGODB_URI',
        'JWT_SECRET_KEY'
    ]
    
    missing_vars = []
    
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n🔧 Please check your .env file")
        return False
    
    return True

def check_model_files():
    """Check if model files exist"""
    model_path = os.getenv('MODEL_PATH', 'models/model_weights.pth')
    
    if not os.path.exists(model_path):
        print(f"⚠️  Model file not found: {model_path}")
        print("   The server will start but predictions won't work without the model.")
        print("   Please copy your trained model to the models directory.")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🚀 Starting Flask Backend with MongoDB Authentication")
    print("=" * 60)
    
    # Check requirements
    print("📦 Checking requirements...")
    if not check_requirements():
        return
    
    print("✅ All packages installed")
    
    # Check environment
    print("🔧 Checking environment...")
    if not check_environment():
        return
    
    print("✅ Environment configured")
    
    # Check model files
    print("🤖 Checking model files...")
    model_exists = check_model_files()
    if model_exists:
        print("✅ Model files found")
    
    # Display configuration
    print("\n📋 Configuration:")
    print(f"   Host: {os.getenv('HOST', '0.0.0.0')}")
    print(f"   Port: {os.getenv('PORT', 5001)}")
    print(f"   Debug: {os.getenv('DEBUG', 'True')}")
    print(f"   Database: {os.getenv('DATABASE_NAME', 'spare-parts-db')}")
    
    # Ask to create sample users
    create_users = input("\n❓ Create sample users? (y/n): ").strip().lower()
    if create_users == 'y':
        try:
            subprocess.run([sys.executable, 'create_admin.py'], input='2\n', text=True, check=True)
        except subprocess.CalledProcessError:
            print("⚠️  Failed to create sample users, continuing anyway...")
    
    # Start the Flask app
    print("\n🚀 Starting Flask server...")
    print("   Frontend should connect to: http://localhost:5001")
    print("   Health check: http://localhost:5001/health")
    print("   Press Ctrl+C to stop\n")
    
    try:
        # Import and run the Flask app
        from flask_app import app, initialize_app
        
        if initialize_app():
            app.run(
                debug=os.getenv('DEBUG', 'True').lower() == 'true',
                host=os.getenv('HOST', '0.0.0.0'),
                port=int(os.getenv('PORT', 5001))
            )
        else:
            print("❌ Failed to initialize application")
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {str(e)}")

if __name__ == '__main__':
    main()