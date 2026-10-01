# Inventory Demand Prediction API

A Flask-based REST API that uses a trained LSTM model to predict inventory demand based on historical data.

## Features

- **LSTM-based Predictions**: Uses PyTorch LSTM model for time series forecasting
- **Multiple Prediction Types**: Daily, weekly, and single predictions
- **Trend Analysis**: Analyze historical data trends and patterns
- **RESTful API**: Clean REST endpoints for easy integration
- **Model Management**: Automatic model and scaler loading
- **Error Handling**: Comprehensive error handling and validation

## Setup

### Prerequisites

- Python 3.8+
- PyTorch
- Flask
- Required dependencies (see requirements.txt)

### Installation

1. Navigate to the py-backend directory:
```bash
cd py-backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Place your trained model files:
   - `models/model_weights.pth` - Your trained LSTM model weights
   - `models/scaler.pkl` - Your fitted MinMaxScaler (optional)

5. Configure environment variables in `.env` file (optional)

### Running the API

```bash
python app.py
```

The API will start on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the API and model loading status.

### Single Prediction
```
POST /predict-single
```
Make a single prediction based on historical data.

**Request Body:**
```json
{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18]
}
```

### Multiple Predictions
```
POST /predict
```
Make multiple predictions for specified number of days.

**Request Body:**
```json
{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "prediction_days": 7
}
```

### Weekly Predictions
```
POST /predict-weekly
```
Make weekly demand predictions.

**Request Body:**
```json
{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18],
  "weeks_ahead": 4
}
```

### Trend Analysis
```
POST /analyze-trends
```
Analyze trends in historical data.

**Request Body:**
```json
{
  "historical_data": [10, 15, 12, 18, 20, 16, 14, 22, 19, 17, 21, 13, 16, 18]
}
```

### Model Information
```
GET /model-info
```
Get information about the loaded model and its configuration.

## Configuration

The API can be configured using environment variables in the `.env` file:

- `DEBUG`: Enable/disable debug mode
- `HOST`: API host (default: 0.0.0.0)
- `PORT`: API port (default: 5001)
- `MODEL_PATH`: Path to model weights file
- `SCALER_PATH`: Path to scaler file
- `CSV_PATH`: Path to training CSV file

## Model Requirements

Your LSTM model should have the following architecture:
- Input size: 1
- Hidden size: 64
- Number of layers: 2
- Output size: 1
- Sequence length: 14

The model should be saved as a PyTorch state dictionary (.pth file).

## Error Handling

The API includes comprehensive error handling:
- Model loading errors
- Invalid input data
- Insufficient historical data
- Prediction errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Integration

This API is designed to work with the existing frontend application. It provides the same functionality as the Node.js backend but uses the trained LSTM model for predictions.

## Development

To extend the API:

1. Add new endpoints in `app.py`
2. Implement prediction logic in `predictor.py`
3. Add configuration options in `config.py`
4. Update model loading in `model_loader.py`

## Troubleshooting

1. **Model not loading**: Ensure the model file exists and is compatible
2. **Scaler errors**: Check if scaler is fitted or create a new one
3. **Prediction errors**: Verify input data format and size
4. **CORS issues**: Update CORS configuration in config.py