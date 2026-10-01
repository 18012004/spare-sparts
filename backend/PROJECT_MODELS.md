# Spare Parts Forecasting - Models Used

## 📊 Two Statistical Time Series Models

This project implements **two powerful forecasting models** for spare parts inventory prediction:

---

## 1. ARIMA (AutoRegressive Integrated Moving Average)

### What is ARIMA?
A statistical model that predicts future values based on past observations.

### Components:
- **AR (p)** - AutoRegressive: Uses past values to predict future
- **I (d)** - Integrated: Makes data stationary through differencing
- **MA (q)** - Moving Average: Uses past forecast errors

### Model Order: (p, d, q)
- Automatically tuned using grid search
- Selects optimal parameters based on AIC (Akaike Information Criterion)

### Best For:
✅ Linear trends  
✅ Short-term forecasting (1-7 days)  
✅ Stable demand patterns  
✅ Quick predictions  
✅ When you have 10+ data points  

### Strengths:
- Fast and efficient
- Highly interpretable
- Works with limited data
- Auto-tuning available
- Well-established statistical method

---

## 2. SARIMA (Seasonal ARIMA)

### What is SARIMA?
An extension of ARIMA that includes seasonal components to capture repeating patterns.

### Components:
- **ARIMA (p,d,q)** - Base trend model
- **Seasonal (P,D,Q,m)** - Seasonal pattern
  - P, D, Q - Seasonal parameters
  - m - Seasonal period (7 for weekly, 30 for monthly)

### Best For:
✅ Weekly/monthly demand patterns  
✅ Seasonal spare parts  
✅ Weekend/holiday effects  
✅ Cyclical inventory needs  
✅ When you have 14+ data points  

### Strengths:
- Captures seasonality automatically
- Better accuracy for cyclical data
- Interpretable results
- Auto-tuning for all parameters
- Handles complex seasonal patterns

---

## 3. Ensemble Method (ARIMA + SARIMA)

### What is Ensemble?
Combines predictions from both ARIMA and SARIMA for improved accuracy.

### How it Works:
```
Final Prediction = (ARIMA × 50%) + (SARIMA × 50%)
```

### Best For:
✅ Maximum accuracy  
✅ Critical inventory decisions  
✅ Uncertain about data pattern  
✅ High-value spare parts  
✅ When you need robust predictions  

### Strengths:
- Higher accuracy than individual models
- Reduces prediction errors
- Combines strengths of both approaches
- More robust to different patterns

---

## 📈 Model Comparison

| Feature | ARIMA | SARIMA | Ensemble |
|---------|-------|--------|----------|
| **Type** | Statistical | Statistical | Hybrid |
| **Seasonality** | No | Yes | Yes |
| **Min Data** | 10 points | 14 points | 14 points |
| **Speed** | Very Fast | Fast | Fast |
| **Accuracy** | Good | Better | Best |
| **Interpretability** | High | High | Medium |
| **Auto-tuning** | Yes | Yes | Yes |

---

## 🎯 When to Use Each Model

### Use ARIMA when:
- Simple linear trend in demand
- Need fast predictions
- Limited historical data (10-20 points)
- No seasonal pattern observed
- Want to understand model parameters

### Use SARIMA when:
- Weekly or monthly demand patterns
- Seasonal spare parts (e.g., AC parts in summer)
- Weekend vs weekday differences
- Holiday effects on demand
- Have at least 2 weeks of data

### Use Ensemble when:
- Critical inventory item
- Can't afford stockout
- Maximum accuracy required
- Uncertain about demand pattern
- High-value or safety-critical parts

---

## 🔧 API Endpoints

### 1. ARIMA Prediction
```http
POST /predict-arima
Authorization: Bearer <token>

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22],
  "prediction_days": 7,
  "with_intervals": true
}
```

### 2. SARIMA Prediction
```http
POST /predict-sarima
Authorization: Bearer <token>

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "prediction_days": 7,
  "seasonal_period": 7,
  "with_intervals": true
}
```

### 3. Ensemble Prediction
```http
POST /predict-ensemble
Authorization: Bearer <token>

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "prediction_days": 7
}
```

### 4. Compare Models
```http
POST /compare-models
Authorization: Bearer <token>

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18, 20, 25, 22],
  "test_size": 7
}
```

### 5. Check Stationarity
```http
POST /check-stationarity
Authorization: Bearer <token>

{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22]
}
```

### 6. Model Information
```http
GET /model-info
```

---

## 💡 Real-World Examples

### Example 1: Brake Pads (Weekly Pattern)
**Scenario:** Higher demand on weekends when people service their cars

**Data Pattern:**
```
Mon: 45, Tue: 48, Wed: 50, Thu: 52, Fri: 55, Sat: 75, Sun: 70
```

**Best Model:** SARIMA with seasonal_period=7

**Why:** Captures the weekly cycle with higher weekend demand

---

### Example 2: Engine Oil (Steady Growth)
**Scenario:** Consistent demand with gradual increase

**Data Pattern:**
```
Week 1: 20, Week 2: 22, Week 3: 21, Week 4: 23, Week 5: 24
```

**Best Model:** ARIMA

**Why:** Simple linear trend, no seasonality needed

---

### Example 3: Air Filters (Seasonal)
**Scenario:** Higher demand in summer months

**Data Pattern:**
```
Jan: 30, Feb: 32, Mar: 35, Apr: 40, May: 50, Jun: 60, Jul: 65, Aug: 62
```

**Best Model:** SARIMA with seasonal_period=30 (monthly)

**Why:** Clear seasonal pattern with summer peak

---

### Example 4: Critical Safety Part
**Scenario:** Airbag sensors - cannot afford stockout

**Best Model:** Ensemble

**Why:** Maximum accuracy by combining both models

---

## 📊 Technical Details

### Auto-tuning Process:
1. **Grid Search** - Tests multiple (p,d,q) combinations
2. **AIC Minimization** - Selects model with lowest AIC score
3. **Validation** - Ensures model stability and convergence

### Confidence Intervals:
All predictions include 95% confidence intervals:
- **Lower Bound** - Minimum expected demand
- **Prediction** - Most likely demand
- **Upper Bound** - Maximum expected demand

### Performance Metrics:
- **MAE (Mean Absolute Error)** - Average prediction error
- **AIC (Akaike Information Criterion)** - Model quality measure
- **BIC (Bayesian Information Criterion)** - Model complexity penalty

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Test Models
```bash
python test_arima.py
```

### 3. Start Backend
```bash
python run.py
```

### 4. Make Predictions
Use the API endpoints with your historical data

---

## 📚 Key Advantages

### Why These Models?

1. **No Training Required** - Work immediately with your data
2. **Fast Predictions** - Results in milliseconds
3. **Interpretable** - Understand why predictions are made
4. **Auto-tuning** - Automatically finds best parameters
5. **Proven Methods** - Decades of research and real-world use
6. **Flexible** - Works with various data patterns
7. **Confidence Intervals** - Know prediction uncertainty
8. **Small Data** - Works with as few as 10 data points

---

## 🎓 For Project Review/Interview

### Question: "What forecasting models did you use?"

### Answer:
> "I implemented **two statistical time series models** for spare parts demand forecasting:
>
> **1. ARIMA (AutoRegressive Integrated Moving Average)**
> - Handles linear trends and short-term predictions
> - Auto-tunes parameters (p,d,q) using grid search and AIC minimization
> - Works with as few as 10 data points
> - Provides fast, interpretable predictions
>
> **2. SARIMA (Seasonal ARIMA)**
> - Extends ARIMA to capture seasonal patterns
> - Automatically detects weekly/monthly cycles
> - Ideal for spare parts with cyclical demand
> - Requires 14+ data points for seasonal analysis
>
> **3. Ensemble Method**
> - Combines both models (50% ARIMA + 50% SARIMA)
> - Provides highest accuracy by leveraging strengths of both
> - Reduces individual model errors
>
> All models include **auto-tuning**, **confidence intervals**, and **performance metrics**. Users can choose the best model for their specific demand pattern, or use the ensemble for maximum accuracy."

---

## 📖 Summary

Your project uses **industry-standard statistical models** that are:
- ✅ Fast and efficient
- ✅ Highly accurate
- ✅ Easy to interpret
- ✅ Proven in production
- ✅ Suitable for spare parts forecasting

**No deep learning required** - these statistical methods are perfect for your use case!
