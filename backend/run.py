#!/usr/bin/env python3
"""
Run script for the Inventory Prediction API
"""

import os
import sys
from app import app, initialize_app
from config import Config
from dotenv import load_dotenv


def main():
    """Main function to run the Flask application"""
    print("🔧 Initializing Inventory Prediction API...")
    
    # Check if model files exist
    if not os.path.exists(Config.MODEL_PATH):
        print(f"❌ Model file not found: {Config.MODEL_PATH}")
        print("Please ensure your trained model weights are placed in the models directory.")
        sys.exit(1)
    
    # Initialize the application
    if not initialize_app():
        print("❌ Failed to initialize application")
        sys.exit(1)
    
    print(f"🚀 Starting server on {Config.HOST}:{Config.PORT}")
    print(f"📊 Model path: {Config.MODEL_PATH}")
    print(f"🔧 Debug mode: {Config.DEBUG}")
    
    try:
        app.run(
            debug=Config.DEBUG,
            host=Config.HOST,
            port=Config.PORT,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()