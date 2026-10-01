"""
Quick test script for ARIMA and SARIMA models
Run this to verify the models are working correctly
"""

from arima_predictor import ARIMAPredictor, SARIMAPredictor, HoltWintersPredictor, EnsemblePredictor
import numpy as np

def test_arima():
    """Test ARIMA model"""
    print("=" * 50)
    print("Testing ARIMA Model")
    print("=" * 50)
    
    # Sample data with linear trend
    data = [10, 12, 11, 13, 15, 14, 16, 18, 17, 19, 21, 20, 22, 24]
    
    try:
        arima = ARIMAPredictor()
        
        # Check stationarity
        print("\n1. Checking stationarity...")
        stationarity = arima.check_stationarity(data)
        print(f"   Is stationary: {stationarity.get('is_stationary', 'Unknown')}")
        print(f"   P-value: {stationarity.get('p_value', 'N/A')}")
        
        # Fit model
        print("\n2. Fitting ARIMA model...")
        arima.fit(data)
        print(f"   Model order: {arima.order}")
        
        # Make predictions
        print("\n3. Making predictions...")
        predictions = arima.predict(steps=7)
        print(f"   Next 7 days: {[round(p, 2) for p in predictions]}")
        
        # Predictions with intervals
        print("\n4. Predictions with confidence intervals...")
        pred_intervals = arima.predict_with_intervals(steps=3)
        for i, pred in enumerate(pred_intervals):
            print(f"   Day {i+1}: {pred['prediction']:.2f} [{pred['lower_bound']:.2f}, {pred['upper_bound']:.2f}]")
        
        # Model summary
        print("\n5. Model summary...")
        summary = arima.get_model_summary()
        print(f"   AIC: {summary['aic']:.2f}")
        print(f"   BIC: {summary['bic']:.2f}")
        
        print("\n✅ ARIMA test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ ARIMA test failed: {str(e)}")
        return False

def test_sarima():
    """Test SARIMA model"""
    print("\n" + "=" * 50)
    print("Testing SARIMA Model")
    print("=" * 50)
    
    # Sample data with weekly seasonality
    data = [10, 15, 12, 18, 20, 16, 14,  # Week 1
            12, 17, 14, 20, 22, 18, 16,  # Week 2
            14, 19, 16, 22, 24, 20, 18]  # Week 3
    
    try:
        sarima = SARIMAPredictor(seasonal_period=7)
        
        # Fit model
        print("\n1. Fitting SARIMA model...")
        sarima.fit(data)
        print(f"   Model order: {sarima.order}")
        print(f"   Seasonal order: {sarima.seasonal_order}")
        
        # Make predictions
        print("\n2. Making predictions...")
        predictions = sarima.predict(steps=7)
        print(f"   Next 7 days: {[round(p, 2) for p in predictions]}")
        
        # Predictions with intervals
        print("\n3. Predictions with confidence intervals...")
        pred_intervals = sarima.predict_with_intervals(steps=3)
        for i, pred in enumerate(pred_intervals):
            print(f"   Day {i+1}: {pred['prediction']:.2f} [{pred['lower_bound']:.2f}, {pred['upper_bound']:.2f}]")
        
        # Model summary
        print("\n4. Model summary...")
        summary = sarima.get_model_summary()
        print(f"   AIC: {summary['aic']:.2f}")
        print(f"   BIC: {summary['bic']:.2f}")
        
        print("\n✅ SARIMA test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ SARIMA test failed: {str(e)}")
        return False

def test_holt_winters():
    """Test Holt-Winters model"""
    print("\n" + "=" * 50)
    print("Testing Holt-Winters (Exponential Smoothing)")
    print("=" * 50)
    
    # Sample data with trend and seasonality
    data = [10, 15, 12, 18, 20, 16, 14,  # Week 1
            12, 17, 14, 20, 22, 18, 16,  # Week 2
            14, 19, 16, 22, 24, 20, 18]  # Week 3
    
    try:
        hw = HoltWintersPredictor(seasonal_period=7)
        
        # Fit model
        print("\n1. Fitting Holt-Winters model...")
        hw.fit(data)
        print(f"   Seasonal period: {hw.seasonal_period}")
        
        # Make predictions
        print("\n2. Making predictions...")
        predictions = hw.predict(steps=7)
        print(f"   Next 7 days: {[round(p, 2) for p in predictions]}")
        
        # Predictions with intervals
        print("\n3. Predictions with confidence intervals...")
        pred_intervals = hw.predict_with_intervals(steps=3)
        for i, pred in enumerate(pred_intervals):
            print(f"   Day {i+1}: {pred['prediction']:.2f} [{pred['lower_bound']:.2f}, {pred['upper_bound']:.2f}]")
        
        # Model summary
        print("\n4. Model summary...")
        summary = hw.get_model_summary()
        print(f"   Model type: {summary['model_type']}")
        print(f"   Seasonal period: {summary['seasonal_period']}")
        
        print("\n✅ Holt-Winters test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Holt-Winters test failed: {str(e)}")
        return False

def test_ensemble():
    """Test Ensemble model (ARIMA + SARIMA + Holt-Winters)"""
    print("\n" + "=" * 50)
    print("Testing Ensemble Model (ARIMA + SARIMA + Holt-Winters)")
    print("=" * 50)
    
    data = [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18, 20, 25]
    
    try:
        ensemble = EnsemblePredictor(lstm_predictor=None)
        
        # Make predictions
        print("\n1. Making ensemble predictions...")
        result = ensemble.predict(data, steps=5)
        
        print(f"   Ensemble predictions: {[round(p, 2) for p in result['ensemble_predictions']]}")
        print(f"   Models used: {result['models_used']}")
        print(f"   Weights: ARIMA=33%, SARIMA=33%, Holt-Winters=34%")
        
        # Show individual predictions
        print("\n2. Individual model predictions:")
        for model_name, preds in result['individual_predictions'].items():
            display_name = 'HOLT-WINTERS' if model_name == 'holt_winters' else model_name.upper()
            print(f"   {display_name}: {[round(p, 2) for p in preds]}")
        
        print("\n✅ Ensemble test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Ensemble test failed: {str(e)}")
        return False

def test_comparison():
    """Test model comparison"""
    print("\n" + "=" * 50)
    print("Testing Model Comparison")
    print("=" * 50)
    
    # Generate test data
    np.random.seed(42)
    data = [10 + i + np.random.normal(0, 2) for i in range(28)]
    
    try:
        ensemble = EnsemblePredictor(lstm_predictor=None)
        
        print("\n1. Comparing models on test data...")
        comparison = ensemble.compare_models(data, test_size=7)
        
        print("\n2. Results:")
        for model_name, result in comparison.items():
            if model_name == 'actual':
                print(f"   Actual values: {[round(v, 2) for v in result]}")
            elif 'error' not in result:
                print(f"   {model_name.upper()}: MAE = {result['mae']:.2f}")
        
        print("\n✅ Comparison test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Comparison test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🧪 Testing Time Series Forecasting Models\n")
    print("Note: This project uses three statistical models\n")
    
    results = []
    results.append(("ARIMA", test_arima()))
    results.append(("SARIMA", test_sarima()))
    results.append(("Holt-Winters", test_holt_winters()))
    results.append(("Ensemble (3 models)", test_ensemble()))
    results.append(("Model Comparison", test_comparison()))
    
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! All models are ready to use.")
        print("✅ Your project uses three statistical time series models:")
        print("   - ARIMA: For linear trends and short-term forecasting")
        print("   - SARIMA: For seasonal patterns and cyclical demand")
        print("   - Holt-Winters: For exponential smoothing with trend and seasonality")
        print("   - Ensemble: Combines all three for maximum accuracy (33% + 33% + 34%)")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")
