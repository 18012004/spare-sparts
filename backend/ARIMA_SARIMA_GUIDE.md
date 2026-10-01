# ARIMA & SARIMA Forecasting Guide

## Overview

This project now includes **three forecasting models**:
1. **LSTM** - Deep Learning (Neural Network)
2. **ARIMA** - Statistical Time Series Model
3. **SARIMA** - Seasonal ARIMA Model

Plus an **Ensemble Model** that combines all three for maximum accuracy.

---

## What is ARIMA?

**ARIMA** = AutoRegressive Integrated Moving Average

### Components:
- **AR (p)** - AutoRegressive: Uses past values to predict future
- **I (d)** - Integrated: Differencing to make data stationary
- **MA (q)** - Moving Average: Uses past forecast errors

### ARIMA Order: (p, d, q)
- **p** = Number of lag observations (1-3)
- **d** = Degree of differencing (0-2)
- **q** = Size of moving average window (1-3)

### Best For:
- Linear trends
- Short-term forecasting (7-30 days)
- Stable demand patterns
- When you have 10+ data points

---

## What is SARIMA?

**SARIMA** = Seasonal ARIMA

### Additional Components:
- **P** - Seasonal AR order
- **D** - Seasonal differencing
- **Q** - Seasonal MA order
- **m** - Seasonal period (7 for weekly, 30 for monthly)

### SARIMA Order: (p, d, q) x (P, D, Q, m)

### Best For:
- Weekly/monthly patterns
- Seasonal demand (holidays, weekends)
- Cyclical inventory needs
- When you have 14+ data points

---

## API Endpoints

### 1. ARIMA Prediction
```http
POST /predict-arima
Authorization: Bearer <token>
Content-Type: application/json

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "prediction_days": 7,
  "with_intervals": true
}
```

**Response:**
```json
{
  "predictions": [
    {
      "prediction": 19.5,
      "lower_bound": 17.2,
      "upper_bound": 21.8,
      "confidence": 95
    }
  ],
  "model_type": "ARIMA",
  "model_summary": {
    "order": [1, 1, 1],
    "aic": 145.32,
    "bic": 152.18
  },
  "status": "success"
}
```

### 2. SARIMA Prediction
```http
POST /predict-sarima
Authorization: Bearer <token>
Content-Type: application/json

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18, 20, 25, 22, 19, 23, 21],
  "prediction_days": 7,
  "seasonal_period": 7,
  "with_intervals": true
}
```

**Response:**
```json
{
  "predictions": [
    {
      "prediction": 20.3,
      "lower_bound": 18.1,
      "upper_bound": 22.5,
      "confidence": 95
    }
  ],
  "model_type": "SARIMA",
  "model_summary": {
    "order": [1, 1, 1],
    "seasonal_order": [1, 1, 1, 7],
    "aic": 138.45,
    "bic": 148.92
  },
  "seasonal_period": 7,
  "status": "success"
}
```

### 3. Ensemble Prediction (Best Accuracy)
```http
POST /predict-ensemble
Authorization: Bearer <token>
Content-Type: application/json

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "prediction_days": 7
}
```

**Response:**
```json
{
  "ensemble_predictions": [19.2, 20.1, 18.9, 21.3, 22.0, 20.5, 19.8],
  "individual_predictions": {
    "arima": [19.5, 20.3, 19.1, 21.5, 22.2, 20.7, 20.0],
    "sarima": [19.0, 19.9, 18.7, 21.1, 21.8, 20.3, 19.6],
    "lstm": [19.1, 20.0, 18.9, 21.3, 22.0, 20.5, 19.8]
  },
  "models_used": ["arima", "sarima", "lstm"],
  "model_type": "Ensemble (ARIMA + SARIMA + LSTM)",
  "status": "success"
}
```

### 4. Compare Models
```http
POST /compare-models
Authorization: Bearer <token>
Content-Type: application/json

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18, 20, 25, 22, 19, 23, 21, 24],
  "test_size": 7
}
```

**Response:**
```json
{
  "comparison": {
    "arima": {
      "predictions": [20.5, 21.2, 19.8, 22.1, 23.0, 21.5, 20.9],
      "mae": 1.45
    },
    "sarima": {
      "predictions": [20.3, 21.0, 19.6, 21.9, 22.8, 21.3, 20.7],
      "mae": 1.32
    },
    "lstm": {
      "predictions": [20.4, 21.1, 19.7, 22.0, 22.9, 21.4, 20.8],
      "mae": 1.38
    },
    "actual": [20, 25, 22, 19, 23, 21, 24]
  },
  "test_size": 7,
  "status": "success"
}
```

### 5. Check Stationarity
```http
POST /check-stationarity
Authorization: Bearer <token>
Content-Type: application/json

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18]
}
```

**Response:**
```json
{
  "stationarity": {
    "is_stationary": true,
    "adf_statistic": -3.45,
    "p_value": 0.012,
    "critical_values": {
      "1%": -3.43,
      "5%": -2.86,
      "10%": -2.57
    }
  },
  "status": "success"
}
```

---

## Model Comparison

| Feature | ARIMA | SARIMA | LSTM | Ensemble |
|---------|-------|--------|------|----------|
| **Type** | Statistical | Statistical | Deep Learning | Hybrid |
| **Seasonality** | No | Yes | Auto-learned | Yes |
| **Min Data Points** | 10 | 14 | 14 | 14 |
| **Training Speed** | Fast | Medium | Slow | Medium |
| **Prediction Speed** | Fast | Fast | Fast | Medium |
| **Accuracy** | Good | Better | Best | Excellent |
| **Interpretability** | High | High | Low | Medium |
| **Auto-tuning** | Yes | Yes | Pre-trained | Yes |

---

## When to Use Each Model

### Use ARIMA when:
- ✅ You have linear trends
- ✅ Short-term forecasting (1-7 days)
- ✅ Stable demand patterns
- ✅ Need quick predictions
- ✅ Want interpretable results

### Use SARIMA when:
- ✅ You have weekly/monthly patterns
- ✅ Seasonal demand (weekends, holidays)
- ✅ Cyclical inventory needs
- ✅ Need to capture seasonality
- ✅ Have at least 2 weeks of data

### Use LSTM when:
- ✅ Complex non-linear patterns
- ✅ Long-term dependencies
- ✅ Large amounts of historical data
- ✅ Multiple influencing factors
- ✅ Need highest accuracy

### Use Ensemble when:
- ✅ Maximum accuracy required
- ✅ Critical inventory decisions
- ✅ Uncertain about best model
- ✅ Want robust predictions
- ✅ Can afford slightly slower predictions

---

## Technical Details

### Auto-tuning Process

The system automatically finds the best ARIMA/SARIMA parameters using:

1. **Grid Search** - Tests multiple (p,d,q) combinations
2. **AIC Minimization** - Selects model with lowest AIC score
3. **Validation** - Ensures model stability

### Confidence Intervals

Predictions include 95% confidence intervals:
- **Lower Bound** - Minimum expected demand
- **Prediction** - Most likely demand
- **Upper Bound** - Maximum expected demand

### Ensemble Weights

Default weights (can be customized):
- ARIMA: 30%
- SARIMA: 30%
- LSTM: 40%

---

## Example Use Cases

### Case 1: Brake Pads (Weekly Pattern)
```python
# Data shows higher demand on weekends
historical_data = [45, 52, 48, 55, 60, 58, 54, 62, 59, 57, 61, 53, 56, 58]

# Use SARIMA for weekly seasonality
POST /predict-sarima
{
  "historical_data": historical_data,
  "prediction_days": 7,
  "seasonal_period": 7
}
```

### Case 2: Oil Filters (Stable Demand)
```python
# Consistent demand, no seasonality
historical_data = [20, 22, 21, 23, 22, 21, 20, 22, 21, 23]

# Use ARIMA for simple trend
POST /predict-arima
{
  "historical_data": historical_data,
  "prediction_days": 7
}
```

### Case 3: Critical Part (Need Best Accuracy)
```python
# Important part, can't afford stockout
historical_data = [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18]

# Use Ensemble for maximum accuracy
POST /predict-ensemble
{
  "historical_data": historical_data,
  "prediction_days": 7
}
```

---

## Error Handling

### Common Errors:

1. **Insufficient Data**
   ```json
   {
     "error": "Minimum 10 data points required for ARIMA"
   }
   ```

2. **Model Fitting Failed**
   ```json
   {
     "error": "ARIMA fitting error: Data is not stationary"
   }
   ```

3. **Invalid Parameters**
   ```json
   {
     "error": "seasonal_period must be >= 2"
   }
   ```

---

## Performance Tips

1. **Data Quality** - Clean data = better predictions
2. **Sufficient History** - More data = more accurate
3. **Choose Right Model** - Match model to pattern
4. **Use Ensemble** - When accuracy is critical
5. **Monitor Performance** - Compare predictions vs actuals

---

## Model Information Endpoint

```http
GET /model-info
```

**Response:**
```json
{
  "lstm": {
    "available": true,
    "framework": "PyTorch",
    "sequence_length": 14
  },
  "arima": {
    "available": true,
    "description": "AutoRegressive Integrated Moving Average",
    "best_for": "Linear trends, short-term forecasting",
    "auto_tuning": true
  },
  "sarima": {
    "available": true,
    "description": "Seasonal ARIMA",
    "best_for": "Seasonal patterns, weekly/monthly cycles",
    "default_period": 7,
    "auto_tuning": true
  },
  "ensemble": {
    "available": true,
    "description": "Combined ARIMA + SARIMA + LSTM",
    "weights": {"arima": 0.3, "sarima": 0.3, "lstm": 0.4},
    "best_for": "Most accurate predictions"
  }
}
```

---

## Summary

Your project now has **state-of-the-art forecasting** with:
- ✅ ARIMA for linear trends
- ✅ SARIMA for seasonal patterns
- ✅ LSTM for complex patterns
- ✅ Ensemble for maximum accuracy
- ✅ Automatic parameter tuning
- ✅ Confidence intervals
- ✅ Model comparison tools

Choose the right model for your use case and get accurate inventory predictions!
