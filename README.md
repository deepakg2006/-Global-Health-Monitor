# Global Health Monitor - Disease Analysis & Forecasting Platform

A premium, data-driven web application for analyzing and forecasting regional disease trends using Machine Learning.

## 🌟 Features

- **Real-time Disease Analytics**: Interactive dashboard with historical disease data
- **AI-Powered Forecasting**: Machine Learning predictions using Random Forest Regressor
- **Environmental Correlation**: Analysis based on temperature, rainfall, humidity, and population density
- **Premium UI/UX**: Dark theme with glassmorphism effects and smooth animations
- **Interactive Visualizations**: Multiple chart types (Line, Bar, Doughnut) using Chart.js
- **Regional Insights**: Track disease outbreaks across 8 global regions
- **Multi-Disease Tracking**: Monitor 8 different diseases simultaneously

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Generate Synthetic Dataset**
```bash
python data_generator.py
```

3. **Train ML Model**
```bash
python ml_engine.py
```

4. **Start Flask Server**
```bash
python app.py
```

5. **Open Dashboard**
Navigate to: `http://localhost:5000`

## 📊 Project Structure

```
tech day/
├── app.py                  # Flask backend with API endpoints
├── data_generator.py       # Synthetic data generation
├── ml_engine.py           # Machine Learning forecasting engine
├── requirements.txt       # Python dependencies
├── disease_data.csv       # Generated dataset (after running data_generator.py)
├── disease_model.pkl      # Trained ML model (after running ml_engine.py)
├── templates/
│   └── index.html         # Main dashboard HTML
└── static/
    ├── css/
    │   └── style.css      # Premium styling with glassmorphism
    └── js/
        └── main.js        # Interactive JavaScript & Chart.js integration
```

## 🎯 Usage

### Dashboard Features

1. **Global Overview**: View total cases, active regions, and tracked diseases
2. **Trend Analysis**: 90-day historical trend visualization
3. **Regional Distribution**: Compare disease burden across regions
4. **Disease Distribution**: Analyze prevalence of different diseases
5. **Predictive Analytics**: Generate custom forecasts by adjusting:
   - Region
   - Disease type
   - Temperature
   - Rainfall
   - Humidity
   - Population density
   - Forecast duration (7-90 days)

### API Endpoints

- `GET /api/data` - Retrieve aggregated historical data
- `POST /api/predict` - Generate ML predictions
- `GET /api/regions` - List available regions
- `GET /api/diseases` - List tracked diseases

## 🧠 Machine Learning

The forecasting engine uses a **Random Forest Regressor** trained on:
- Temporal features (year, month, day of year, quarter)
- Geographic features (region encoding)
- Disease type encoding
- Environmental factors (temperature, rainfall, humidity)
- Population density

**Model Performance** (typical):
- Test R² Score: ~0.85-0.90
- Mean Absolute Error: ~5-10 cases

## 🎨 Design Philosophy

- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Dark Theme**: Easy on the eyes with vibrant accent colors
- **Gradient Accents**: Cyan, purple, and pink gradients
- **Smooth Animations**: Micro-interactions for enhanced UX
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📝 Data Schema

The synthetic dataset includes:
- **Date**: Daily records over 3 years
- **Region**: 8 global regions
- **Disease**: 8 tracked diseases
- **Temperature_C**: Daily temperature (15-35°C)
- **Rainfall_mm**: Daily rainfall (0-300mm)
- **Humidity_Percent**: Daily humidity (40-90%)
- **Population_Density**: Per km² (50-5000)
- **Case_Count**: Reported disease cases

## ⚠️ Disclaimer

This application uses **synthetic data** for demonstration purposes only. It is not intended for real-world public health decision-making.

## 🛠️ Technologies

- **Backend**: Python, Flask, Flask-CORS
- **ML/Data**: Scikit-learn, Pandas, NumPy
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js
- **Typography**: Google Fonts (Inter)

## 📄 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ for Public Health Insights**
