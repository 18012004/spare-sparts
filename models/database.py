import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Database:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            database_name = os.getenv('DATABASE_NAME', 'spare-parts-db')
            
            if not mongodb_uri:
                raise ValueError("MONGODB_URI not found in environment variables")
            
            self._client = MongoClient(mongodb_uri)
            self._db = self._client[database_name]
            
            # Test the connection
            self._client.admin.command('ping')
            logging.info(f"✅ Connected to MongoDB database: {database_name}")
            
        except ConnectionFailure as e:
            logging.error(f"❌ Failed to connect to MongoDB: {str(e)}")
            raise
        except Exception as e:
            logging.error(f"❌ Database connection error: {str(e)}")
            raise
    
    def get_db(self):
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        return self.get_db()[collection_name]
    
    def close_connection(self):
        """Close database connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logging.info("Database connection closed")

# Global database instance
db = Database()