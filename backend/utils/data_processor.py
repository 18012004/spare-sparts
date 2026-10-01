import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta

class DataProcessor:
    def __init__(self):
        self.scaler = MinMaxScaler()
    
    def load_and_process_csv(self, csv_path):
        """Load and process inventory CSV data"""
        try:
            df = pd.read_csv(csv_path)
            
            # Find date column
            date_cols = [c for c in df.columns if 'date' in c.lower()]
            if not date_cols:
                raise ValueError("No date column found in CSV")
            
            date_col = date_cols[0]
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            df = df.sort_values(date_col)
            
            # Aggregate daily counts
            daily = df.groupby(df[date_col].dt.date).size().reset_index(name='count')
            daily[date_col] = pd.to_datetime(daily[date_col])
            daily = daily.set_index(date_col).asfreq('D', fill_value=0)
            
            return daily['count'].values
            
        except Exception as e:
            raise Exception(f"Error processing CSV: {str(e)}")
    
    def create_sequences(self, data, seq_len=14):
        """Create sequences for LSTM training/prediction"""
        xs, ys = [], []
        for i in range(len(data) - seq_len):
            xs.append(data[i:i + seq_len])
            ys.append(data[i + seq_len])
        return np.array(xs), np.array(ys)
    
    def scale_data(self, data):
        """Scale data using MinMaxScaler"""
        data_reshaped = data.reshape(-1, 1)
        scaled_data = self.scaler.fit_transform(data_reshaped)
        return scaled_data.flatten()
    
    def inverse_scale(self, scaled_data):
        """Inverse scale data"""
        scaled_reshaped = scaled_data.reshape(-1, 1)
        original_data = self.scaler.inverse_transform(scaled_reshaped)
        return original_data.flatten()
    
    def prepare_weekly_data(self, df, date_col='invoice_date'):
        """Prepare weekly aggregated data"""
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df = df.dropna(subset=[date_col])
        
        # Group by week
        weekly_data = df.groupby(pd.Grouper(key=date_col, freq='W')).size().reset_index(name='count')
        
        # Add time features
        weekly_data['weekofyear'] = weekly_data[date_col].dt.isocalendar().week.astype(int)
        weekly_data['month'] = weekly_data[date_col].dt.month
        weekly_data['year'] = weekly_data[date_col].dt.year
        
        # Add lag features
        weekly_data['lag1'] = weekly_data['count'].shift(1)
        weekly_data['lag2'] = weekly_data['count'].shift(2)
        weekly_data['rolling_mean_3'] = weekly_data['count'].rolling(window=3).mean()
        
        return weekly_data.dropna()
    
    def calculate_trend_metrics(self, data):
        """Calculate trend and seasonal metrics"""
        series = pd.Series(data)
        
        metrics = {
            'mean': series.mean(),
            'std': series.std(),
            'trend': 'increasing' if series.tail(7).mean() > series.head(7).mean() else 'decreasing',
            'volatility': series.std() / series.mean() if series.mean() > 0 else 0,
            'min': series.min(),
            'max': series.max()
        }
        
        return metrics