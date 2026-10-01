# Spare Parts Forecasting System

A full-stack web application for spare parts inventory forecasting with React frontend, Express.js backend, and MongoDB Atlas database.

## Features

- **Dashboard**: Overview of inventory statistics, trends, and predictions
- **Forecasting**: Predict demand for specific spare parts using time series analysis
- **Data Upload**: Admin-only CSV data upload functionality
- **Alerts**: Automated alerts for parts with rising demand
- **EDA (Exploratory Data Analysis)**: Comprehensive data analysis and visualization
- **User Authentication**: Role-based access (Admin/Staff)

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Chart.js with react-chartjs-2
- React Router DOM
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- CSV parsing
- Simple statistics for forecasting

### Database
- MongoDB Atlas (NoSQL)

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   └── ...
│   ├── public/
│   └── package.json
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and configure your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/spare-parts-db?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and update the `MONGODB_URI` in your `.env` file
5. Whitelist your IP address or use 0.0.0.0/0 for development

## Usage

### Initial Setup
1. Start both frontend and backend servers
2. Open `http://localhost:3000` in your browser
3. Create an admin account by signing up with role "admin"
4. Login with your admin credentials

### Data Upload
1. As an admin user, navigate to the "Upload Data" page
2. Upload a CSV file with the following required columns:
   - `invoice_date`: Date in DD-MM-YY, DD-MM-YYYY, or YYYY-MM-DD format
   - `invoice_line_text`: Spare part name/description

### Using the System
1. **Dashboard**: View overall statistics and trends
2. **Forecast**: Select a part and predict future demand
3. **Alerts**: Monitor parts with rising demand patterns
4. **EDA**: Explore data patterns and distributions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

### Forecasting
- `POST /api/forecast` - Generate forecast for a part

### Data Management
- `POST /api/upload` - Upload CSV data (Admin only)
- `GET /api/parts` - Get all unique parts
- `GET /api/parts/:partName` - Get part details

### Alerts
- `GET /api/alerts` - Get demand alerts
- `POST /api/alerts/purchase` - Create purchase request

### EDA
- `GET /api/eda` - Get EDA overview
- `GET /api/eda/part-trend/:partName` - Get part-specific trend

## CSV Data Format

The system expects CSV files with the following structure:

```csv
invoice_date,invoice_line_text
01-01-23,BRAKE PAD SET FRONT
02-01-23,ENGINE OIL FILTER
03-01-23,SPARK PLUG SET
```

Additional columns are allowed and will be stored but not used in analysis.

## Forecasting Algorithm

The system uses a simple linear regression approach for forecasting:
1. Aggregates data by month for each part
2. Applies linear regression to historical demand
3. Extrapolates future demand based on the trend
4. Ensures non-negative predictions

## Security Features

- JWT-based authentication
- Role-based access control (Admin/Staff)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm start    # React development server
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

This creates a `build` folder with production-ready files.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please create an issue in the repository.