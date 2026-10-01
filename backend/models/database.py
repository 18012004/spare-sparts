import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
from dotenv import load_dotenv
import certifi
import ssl
from urllib.parse import quote_plus

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
        # Don't connect automatically - wait for explicit connect() call
        pass
    
    def connect(self):
        """Connect to MongoDB"""
        # Check if already connected and working
        if self._client is not None:
            try:
                self._client.admin.command('ping')
                return  # Already connected and working
            except:
                # Connection is stale, close it
                try:
                    self._client.close()
                except:
                    pass
                self._client = None
                self._db = None
            
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            database_name = os.getenv('DATABASE_NAME', 'spare-parts-db')
            
            if not mongodb_uri:
                raise ValueError("MONGODB_URI not found in environment variables")
            
            # Try multiple connection strategies for Windows/OpenSSL compatibility
            connection_configs = [
                # Strategy 1: Disable TLS/SSL validation (works on Windows with OpenSSL 3.0)
                {
                    'tls': True,
                    'tlsAllowInvalidCertificates': True,
                    'tlsAllowInvalidHostnames': True,
                    'serverSelectionTimeoutMS': 10000,
                    'connectTimeoutMS': 10000,
                },
                # Strategy 2: Use certifi with relaxed settings
                {
                    'tlsCAFile': certifi.where(),
                    'tls': True,
                    'tlsAllowInvalidHostnames': True,
                    'serverSelectionTimeoutMS': 10000,
                },
                # Strategy 3: Custom SSL context
                {
                    'ssl': True,
                    'ssl_cert_reqs': ssl.CERT_NONE,
                    'serverSelectionTimeoutMS': 10000,
                },
                # Strategy 4: Let pymongo handle SSL automatically
                {
                    'serverSelectionTimeoutMS': 10000,
                }
            ]
            
            last_error = None
            for i, config in enumerate(connection_configs):
                temp_client = None
                try:
                    logging.info(f"Attempting MongoDB connection strategy {i+1}...")
                    temp_client = MongoClient(mongodb_uri, **config)
                    temp_db = temp_client[database_name]
                    
                    # Test the connection
                    temp_client.admin.command('ping')
                    
                    # Success! Save the working client
                    self._client = temp_client
                    self._db = temp_db
                    logging.info(f"✅ Connected to MongoDB database: {database_name} (strategy {i+1})")
                    return
                    
                except Exception as e:
                    last_error = e
                    logging.warning(f"Strategy {i+1} failed: {str(e)[:100]}")
                    if temp_client:
                        try:
                            temp_client.close()
                        except:
                            pass
                    continue
            
            # All strategies failed
            raise last_error
            
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