"""
ARIMA and SARIMA Time Series Forecasting Module
Provides statistical forecasting methods for inventory demand prediction
"""

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.stattools import adfuller
from itertools import product
import warnings
warnings.filterwarnings('ignore')


class ARIMAPredictor:
    """ARIMA-based demand forecasting"""
    
    def __init__(self):
        self.model = None
        self.fitted_model = None
        self.order = None
        
    def check_stationarity(self, data):
        """Check if time series is stationary using ADF test"""
        try:
            result = adfuller(data)
            return {
                'is_stationary': result[1] < 0.05,
                'adf_statistic': result[0],
                'p_value': result[1],
                'critical_values': result[4]
            }
        except Exception as e:
            return {'is_stationary': False, 'error': str(e)}
    
    def auto_find_order(self, data, seasonal=False, fast_mode=False):
        """Automatically find best ARIMA order using grid search"""
        try:
            # Convert to pandas Series
            if not isinstance(data, pd.Series):
                data = pd.Series(data)
            
            # Use smaller ranges for fast mode (long-term predictions)
            if fast_mode:
                p_range = range(0, 2)
                d_range = range(0, 2)
                q_range = range(0, 2)
            else:
                p_range = range(0, 3)
                d_range = range(0, 2)
                q_range = range(0, 3)
            
            best_aic = np.inf
            best_order = (1, 1, 1)
            best_seasonal_order = None
            
            # Grid search for non-seasonal
            for p, d, q in product(p_range, d_range, q_range):
                try:
                    if seasonal:
                        # For SARIMA - use smaller ranges in fast mode
                        if fast_mode:
                            P_range = range(0, 2)
                            D_range = range(0, 1)
                            Q_range = range(0, 2)
                        else:
                            P_range = range(0, 2)
                            D_range = range(0, 2)
                            Q_range = range(0, 2)
                        m = 7  # Weekly seasonality
                        
                        for P, D, Q in product(P_range, D_range, Q_range):
                            try:
                                model = SARIMAX(data, order=(p, d, q), 
                                              seasonal_order=(P, D, Q, m),
                                              enforce_stationarity=False,
                                              enforce_invertibility=False)
                                fitted = model.fit(disp=False, maxiter=50 if fast_mode else 100)
                                if fitted.aic < best_aic:
                                    best_aic = fitted.aic
                                    best_order = (p, d, q)
                                    best_seasonal_order = (P, D, Q, m)
                            except:
                                continue
                    else:
                        # For ARIMA
                        model = ARIMA(data, order=(p, d, q))
                        fitted = model.fit(maxiter=50 if fast_mode else 100)
                        if fitted.aic < best_aic:
                            best_aic = fitted.aic
                            best_order = (p, d, q)
                except:
                    continue
            
            return best_order, best_seasonal_order
        except Exception as e:
            # Default orders if grid search fails
            return (1, 1, 1), (1, 1, 1, 7) if seasonal else None
    
    def fit(self, data, order=None):
        """Fit ARIMA model to historical data"""
        try:
            # Convert to pandas Series
            if not isinstance(data, pd.Series):
                data = pd.Series(data)
            
            # Auto-find order if not provided
            if order is None:
                order, _ = self.auto_find_order(data, seasonal=False)
            
            self.order = order
            
            # Fit ARIMA model
            self.model = ARIMA(data, order=order)
            self.fitted_model = self.model.fit()
            
            return True
        except Exception as e:
            raise Exception(f"ARIMA fitting error: {str(e)}")
    
    def predict(self, steps=1):
        """Make predictions for future steps"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast = self.fitted_model.forecast(steps=steps)
            
            # Ensure non-negative predictions
            predictions = [max(0, float(pred)) for pred in forecast]
            
            return predictions
        except Exception as e:
            raise Exception(f"ARIMA prediction error: {str(e)}")
    
    def predict_with_intervals(self, steps=1, alpha=0.05):
        """Make predictions with confidence intervals"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast_result = self.fitted_model.get_forecast(steps=steps)
            forecast = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int(alpha=alpha)
            
            predictions = []
            for i in range(steps):
                predictions.append({
                    'prediction': max(0, float(forecast.iloc[i])),
                    'lower_bound': max(0, float(conf_int.iloc[i, 0])),
                    'upper_bound': max(0, float(conf_int.iloc[i, 1])),
                    'confidence': int((1 - alpha) * 100)
                })
            
            return predictions
        except Exception as e:
            raise Exception(f"ARIMA prediction with intervals error: {str(e)}")
    
    def get_model_summary(self):
        """Get model summary statistics"""
        if self.fitted_model is None:
            return None
        
        return {
            'order': self.order,
            'aic': float(self.fitted_model.aic),
            'bic': float(self.fitted_model.bic),
            'model_type': 'ARIMA'
        }


class SARIMAPredictor:
    """SARIMA-based demand forecasting with seasonality"""
    
    def __init__(self, seasonal_period=7):
        self.model = None
        self.fitted_model = None
        self.order = None
        self.seasonal_order = None
        self.seasonal_period = seasonal_period
    
    def fit(self, data, order=None, seasonal_order=None):
        """Fit SARIMA model to historical data"""
        try:
            # Convert to pandas Series
            if not isinstance(data, pd.Series):
                data = pd.Series(data)
            
            # Auto-find orders if not provided
            if order is None or seasonal_order is None:
                predictor = ARIMAPredictor()
                order, seasonal_order = predictor.auto_find_order(data, seasonal=True)
            
            self.order = order
            self.seasonal_order = seasonal_order
            
            # Fit SARIMA model
            self.model = SARIMAX(
                data,
                order=order,
                seasonal_order=seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            self.fitted_model = self.model.fit(disp=False)
            
            return True
        except Exception as e:
            raise Exception(f"SARIMA fitting error: {str(e)}")
    
    def predict(self, steps=1):
        """Make predictions for future steps"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast = self.fitted_model.forecast(steps=steps)
            
            # Ensure non-negative predictions
            predictions = [max(0, float(pred)) for pred in forecast]
            
            return predictions
        except Exception as e:
            raise Exception(f"SARIMA prediction error: {str(e)}")
    
    def predict_with_intervals(self, steps=1, alpha=0.05):
        """Make predictions with confidence intervals"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast_result = self.fitted_model.get_forecast(steps=steps)
            forecast = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int(alpha=alpha)
            
            predictions = []
            for i in range(steps):
                predictions.append({
                    'prediction': max(0, float(forecast.iloc[i])),
                    'lower_bound': max(0, float(conf_int.iloc[i, 0])),
                    'upper_bound': max(0, float(conf_int.iloc[i, 1])),
                    'confidence': int((1 - alpha) * 100)
                })
            
            return predictions
        except Exception as e:
            raise Exception(f"SARIMA prediction with intervals error: {str(e)}")
    
    def get_model_summary(self):
        """Get model summary statistics"""
        if self.fitted_model is None:
            return None
        
        return {
            'order': self.order,
            'seasonal_order': self.seasonal_order,
            'aic': float(self.fitted_model.aic),
            'bic': float(self.fitted_model.bic),
            'model_type': 'SARIMA'
        }


class HoltWintersPredictor:
    """Holt-Winters Exponential Smoothing predictor"""
    
    def __init__(self, seasonal_period=7):
        self.model = None
        self.fitted_model = None
        self.seasonal_period = seasonal_period
    
    def fit(self, data, seasonal='add', trend='add'):
        """Fit Holt-Winters model to historical data"""
        try:
            # Convert to pandas Series
            if not isinstance(data, pd.Series):
                data = pd.Series(data)
            
            # Need at least 2 seasonal periods
            if len(data) < self.seasonal_period * 2:
                # Use simple exponential smoothing if not enough data
                self.model = ExponentialSmoothing(
                    data,
                    trend=trend,
                    seasonal=None
                )
            else:
                # Use full Holt-Winters with seasonality
                self.model = ExponentialSmoothing(
                    data,
                    trend=trend,
                    seasonal=seasonal,
                    seasonal_periods=self.seasonal_period
                )
            
            self.fitted_model = self.model.fit()
            return True
            
        except Exception as e:
            raise Exception(f"Holt-Winters fitting error: {str(e)}")
    
    def predict(self, steps=1):
        """Make predictions for future steps"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast = self.fitted_model.forecast(steps=steps)
            
            # Ensure non-negative predictions
            predictions = [max(0, float(pred)) for pred in forecast]
            
            return predictions
        except Exception as e:
            raise Exception(f"Holt-Winters prediction error: {str(e)}")
    
    def predict_with_intervals(self, steps=1, alpha=0.05):
        """Make predictions with confidence intervals"""
        try:
            if self.fitted_model is None:
                raise Exception("Model not fitted. Call fit() first.")
            
            forecast = self.fitted_model.forecast(steps=steps)
            
            # Calculate prediction intervals using standard error
            # Simple approximation: ±1.96 * std for 95% CI
            residuals = self.fitted_model.resid
            std_error = np.std(residuals)
            z_score = 1.96  # 95% confidence
            
            predictions = []
            for i in range(steps):
                pred_value = float(forecast.iloc[i]) if hasattr(forecast, 'iloc') else float(forecast[i])
                margin = z_score * std_error * np.sqrt(i + 1)  # Increases with forecast horizon
                
                predictions.append({
                    'prediction': max(0, pred_value),
                    'lower_bound': max(0, pred_value - margin),
                    'upper_bound': max(0, pred_value + margin),
                    'confidence': int((1 - alpha) * 100)
                })
            
            return predictions
        except Exception as e:
            raise Exception(f"Holt-Winters prediction with intervals error: {str(e)}")
    
    def get_model_summary(self):
        """Get model summary statistics"""
        if self.fitted_model is None:
            return None
        
        return {
            'seasonal_period': self.seasonal_period,
            'aic': float(self.fitted_model.aic) if hasattr(self.fitted_model, 'aic') else None,
            'model_type': 'Holt-Winters'
        }


class EnsemblePredictor:
    """Ensemble predictor combining ARIMA, SARIMA, and Holt-Winters"""
    
    def __init__(self, lstm_predictor=None):
        self.arima = ARIMAPredictor()
        self.sarima = SARIMAPredictor()
        self.holt_winters = HoltWintersPredictor()
        self.lstm_predictor = lstm_predictor
        # Equal weights for all three models
        self.weights = {'arima': 0.33, 'sarima': 0.33, 'holt_winters': 0.34}
    
    def fit(self, data):
        """Fit all models"""
        results = {}
        
        # Fit ARIMA
        try:
            self.arima.fit(data)
            results['arima'] = 'success'
        except Exception as e:
            results['arima'] = f'failed: {str(e)}'
        
        # Fit SARIMA
        try:
            self.sarima.fit(data)
            results['sarima'] = 'success'
        except Exception as e:
            results['sarima'] = f'failed: {str(e)}'
        
        return results
    
    def predict(self, data, steps=1):
        """Make ensemble predictions using ARIMA, SARIMA, and Holt-Winters"""
        predictions = []
        weights_used = []
        
        # ARIMA prediction
        try:
            self.arima.fit(data)
            arima_pred = self.arima.predict(steps)
            predictions.append(('arima', arima_pred, self.weights['arima']))
            weights_used.append(self.weights['arima'])
        except:
            pass
        
        # SARIMA prediction
        try:
            self.sarima.fit(data)
            sarima_pred = self.sarima.predict(steps)
            predictions.append(('sarima', sarima_pred, self.weights['sarima']))
            weights_used.append(self.weights['sarima'])
        except:
            pass
        
        # Holt-Winters prediction
        try:
            self.holt_winters.fit(data)
            hw_pred = self.holt_winters.predict(steps)
            predictions.append(('holt_winters', hw_pred, self.weights['holt_winters']))
            weights_used.append(self.weights['holt_winters'])
        except:
            pass
        
        # Combine predictions
        if not predictions:
            raise Exception("All models failed to predict")
        
        # Normalize weights
        total_weight = sum(weights_used)
        
        ensemble_predictions = []
        for step in range(steps):
            weighted_sum = 0
            for model_name, preds, weight in predictions:
                weighted_sum += preds[step] * (weight / total_weight)
            ensemble_predictions.append(max(0, weighted_sum))
        
        return {
            'ensemble_predictions': ensemble_predictions,
            'individual_predictions': {
                name: preds for name, preds, _ in predictions
            },
            'models_used': [name for name, _, _ in predictions]
        }
    
    def compare_models(self, data, test_size=7):
        """Compare performance of ARIMA, SARIMA, and Holt-Winters models"""
        if len(data) < test_size + 14:
            raise Exception("Insufficient data for comparison")
        
        train_data = data[:-test_size]
        test_data = data[-test_size:]
        
        results = {}
        
        # Test ARIMA
        try:
            self.arima.fit(train_data)
            arima_pred = self.arima.predict(test_size)
            arima_mae = np.mean(np.abs(np.array(arima_pred) - np.array(test_data)))
            results['arima'] = {'predictions': arima_pred, 'mae': float(arima_mae)}
        except Exception as e:
            results['arima'] = {'error': str(e)}
        
        # Test SARIMA
        try:
            self.sarima.fit(train_data)
            sarima_pred = self.sarima.predict(test_size)
            sarima_mae = np.mean(np.abs(np.array(sarima_pred) - np.array(test_data)))
            results['sarima'] = {'predictions': sarima_pred, 'mae': float(sarima_mae)}
        except Exception as e:
            results['sarima'] = {'error': str(e)}
        
        # Test Holt-Winters
        try:
            self.holt_winters.fit(train_data)
            hw_pred = self.holt_winters.predict(test_size)
            hw_mae = np.mean(np.abs(np.array(hw_pred) - np.array(test_data)))
            results['holt_winters'] = {'predictions': hw_pred, 'mae': float(hw_mae)}
        except Exception as e:
            results['holt_winters'] = {'error': str(e)}
        
        results['actual'] = list(test_data)
        
        return results
