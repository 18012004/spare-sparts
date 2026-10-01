import torch
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from config import Config

class InventoryPredictor:
    def __init__(self, model, device):
        self.model = model
        self.device = device
        self.seq_len = Config.SEQUENCE_LENGTH
    
    def create_sequences(self, data, seq_len=None):
        """Create sequences for LSTM prediction"""
        if seq_len is None:
            seq_len = self.seq_len
            
        if len(data) < seq_len:
            # Pad with zeros if not enough data
            padded_data = np.zeros(seq_len)
            padded_data[-len(data):] = data
            return padded_data.reshape(1, seq_len, 1)
        else:
            return data[-seq_len:].reshape(1, seq_len, 1)
    
    def normalize_data(self, data):
        """Simple min-max normalization"""
        data_array = np.array(data)
        min_val = np.min(data_array)
        max_val = np.max(data_array)
        
        if max_val == min_val:
            return np.zeros_like(data_array), min_val, max_val
        
        normalized = (data_array - min_val) / (max_val - min_val)
        return normalized, min_val, max_val
    
    def denormalize_data(self, normalized_data, min_val, max_val):
        """Reverse min-max normalization"""
        if max_val == min_val:
            return np.full_like(normalized_data, min_val)
        
        return normalized_data * (max_val - min_val) + min_val
    
    def predict_single(self, historical_data):
        """Make a single prediction"""
        try:
            # Normalize data
            normalized_data, min_val, max_val = self.normalize_data(historical_data)
            
            # Create sequence
            seq = self.create_sequences(normalized_data)
            seq_tensor = torch.tensor(seq, dtype=torch.float32).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                pred_normalized = self.model(seq_tensor).cpu().numpy()
                pred_actual = self.denormalize_data(pred_normalized[0, 0], min_val, max_val)
            
            return max(0, float(pred_actual))
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def predict_multiple(self, historical_data, prediction_days):
        """Make multiple predictions"""
        try:
            # Normalize data
            normalized_data, min_val, max_val = self.normalize_data(historical_data)
            
            # Generate predictions
            predictions = []
            current_sequence = normalized_data.copy()
            
            with torch.no_grad():
                for _ in range(prediction_days):
                    # Create sequence for prediction
                    seq = self.create_sequences(current_sequence)
                    seq_tensor = torch.tensor(seq, dtype=torch.float32).to(self.device)
                    
                    # Make prediction
                    pred_normalized = self.model(seq_tensor).cpu().numpy()
                    pred_actual = self.denormalize_data(pred_normalized[0, 0], min_val, max_val)
                    
                    predictions.append(max(0, float(pred_actual)))
                    
                    # Update sequence for next prediction
                    current_sequence = np.append(current_sequence[1:], pred_normalized[0, 0])
            
            return predictions
            
        except Exception as e:
            raise Exception(f"Multiple prediction error: {str(e)}")
    
    def predict_weekly(self, historical_data, weeks_ahead):
        """Predict weekly demand"""
        try:
            # Convert daily data to weekly if needed
            if len(historical_data) > 52:  # Assume daily data if more than 52 points
                # Convert to weekly by taking every 7th point or averaging
                weekly_data = []
                for i in range(0, len(historical_data), 7):
                    week_sum = sum(historical_data[i:i+7])
                    weekly_data.append(week_sum)
                historical_data = weekly_data
            
            # Make predictions
            predictions = self.predict_multiple(historical_data, weeks_ahead)
            
            # Format as weekly predictions
            weekly_predictions = []
            for i, pred in enumerate(predictions):
                weekly_predictions.append({
                    'week': i + 1,
                    'predicted_demand': pred,
                    'confidence': self._calculate_confidence(historical_data, pred)
                })
            
            return weekly_predictions
            
        except Exception as e:
            raise Exception(f"Weekly prediction error: {str(e)}")
    
    def _calculate_confidence(self, historical_data, prediction):
        """Calculate confidence level for prediction"""
        try:
            # Simple confidence based on historical variance
            historical_std = np.std(historical_data)
            historical_mean = np.mean(historical_data)
            
            if historical_mean == 0:
                return 'low'
            
            # Calculate coefficient of variation
            cv = historical_std / historical_mean
            
            if cv < 0.2:
                return 'high'
            elif cv < 0.5:
                return 'medium'
            else:
                return 'low'
                
        except:
            return 'medium'
    
    def analyze_trends(self, historical_data):
        """Analyze trends in historical data"""
        try:
            series = pd.Series(historical_data)
            
            # Basic statistics
            recent_avg = series.tail(7).mean() if len(series) >= 7 else series.mean()
            overall_avg = series.mean()
            
            # Trend direction
            if len(series) >= 14:
                first_half = series.head(len(series)//2).mean()
                second_half = series.tail(len(series)//2).mean()
                trend_direction = "increasing" if second_half > first_half else "decreasing"
            else:
                trend_direction = "increasing" if recent_avg > overall_avg else "decreasing"
            
            # Volatility
            volatility = series.std()
            
            # Seasonal pattern (if enough data)
            seasonal_pattern = None
            if len(series) >= 28:  # At least 4 weeks of data
                weekly_avg = []
                for i in range(7):
                    weekly_values = series[i::7]  # Every 7th value starting from i
                    if len(weekly_values) > 0:
                        weekly_avg.append(weekly_values.mean())
                seasonal_pattern = weekly_avg
            
            return {
                'trend_direction': trend_direction,
                'recent_average': float(recent_avg),
                'overall_average': float(overall_avg),
                'volatility': float(volatility),
                'seasonal_pattern': seasonal_pattern,
                'data_points': len(historical_data)
            }
            
        except Exception as e:
            raise Exception(f"Trend analysis error: {str(e)}")