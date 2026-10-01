import torch
import torch.nn as nn
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from config import Config

class LSTMModel(nn.Module):
    """LSTM Model for inventory demand prediction"""
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        # Initialize hidden state with zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))
        
        # Apply dropout and get the last output
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)
        return out

class ModelLoader:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.scaler = None
        
    def load_model(self, model_path=None):
        """Load the trained LSTM model"""
        if model_path is None:
            model_path = Config.MODEL_PATH
            
        try:
            # Initialize model
            self.model = LSTMModel(
                input_size=Config.INPUT_SIZE,
                hidden_size=Config.HIDDEN_SIZE,
                num_layers=Config.NUM_LAYERS,
                output_size=Config.OUTPUT_SIZE
            ).to(self.device)
            
            # Load weights
            if os.path.exists(model_path):
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model.eval()
                print(f"✅ Model loaded from {model_path}")
                return True
            else:
                print(f"❌ Model file not found: {model_path}")
                return False
                
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False
    
    def load_scaler(self, scaler_path=None):
        """Load the data scaler"""
        if scaler_path is None:
            scaler_path = Config.SCALER_PATH
            
        try:
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                print(f"✅ Scaler loaded from {scaler_path}")
                return True
            else:
                # Create a default scaler
                self.scaler = MinMaxScaler()
                print(f"⚠️ Scaler file not found: {scaler_path}. Using default MinMaxScaler.")
                return True
                
        except Exception as e:
            print(f"❌ Error loading scaler: {str(e)}")
            self.scaler = MinMaxScaler()
            return True
    
    def save_scaler(self, scaler_path=None):
        """Save the fitted scaler"""
        if scaler_path is None:
            scaler_path = Config.SCALER_PATH
            
        try:
            os.makedirs(os.path.dirname(scaler_path), exist_ok=True)
            with open(scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            print(f"✅ Scaler saved to {scaler_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving scaler: {str(e)}")
            return False
    
    def get_model(self):
        """Get the loaded model"""
        return self.model
    
    def get_scaler(self):
        """Get the loaded scaler"""
        return self.scaler
    
    def is_ready(self):
        """Check if model and scaler are loaded"""
        return self.model is not None and self.scaler is not None