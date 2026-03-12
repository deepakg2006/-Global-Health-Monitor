"""
Flask Backend for Disease Analysis Dashboard
Provides API endpoints for data retrieval and ML predictions
"""
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from ml_engine import DiseaseForecaster
import os
import json
import google.generativeai as genai

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠ GEMINI_API_KEY environment variable not set. Gemini features will not work.")
genai.configure(api_key=api_key)
generation_config = {
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "application/json",
}
gemini_model = genai.GenerativeModel(
  model_name="gemini-2.5-flash",
  generation_config=generation_config,
)

app = Flask(__name__)
CORS(app)

# Initialize ML model
forecaster = DiseaseForecaster()

# Load data and model on startup
DATA_FILE = 'disease_data.csv'
MODEL_FILE = 'disease_model.pkl'

if os.path.exists(MODEL_FILE):
    forecaster.load_model(MODEL_FILE)
    print("✓ Model loaded successfully")
else:
    print("⚠ Model not found. Please train the model first.")

if os.path.exists(DATA_FILE):
    df_global = pd.read_csv(DATA_FILE)
    df_global['Date'] = pd.to_datetime(df_global['Date'])
    print(f"✓ Loaded {len(df_global)} historical records")
else:
    df_global = None
    print("⚠ Data file not found. Please generate data first.")

    

@app.route('/')
def index():
    """Serve the main dashboard"""
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    """Get aggregated historical data"""
    if df_global is None:
        return jsonify({'error': 'Data not available'}), 500
    
    # Get recent data (last 90 days)
    recent_date = df_global['Date'].max() - timedelta(days=90)
    df_recent = df_global[df_global['Date'] >= recent_date].copy()
    
    # Aggregate by date
    daily_cases = df_recent.groupby('Date')['Case_Count'].sum().reset_index()
    daily_cases['Date'] = daily_cases['Date'].dt.strftime('%Y-%m-%d')
    
    # Aggregate by region
    regional_cases = df_global.groupby('Region')['Case_Count'].sum().reset_index()
    regional_cases = regional_cases.sort_values('Case_Count', ascending=False)
    
    # Aggregate by disease
    disease_cases = df_global.groupby('Disease')['Case_Count'].sum().reset_index()
    disease_cases = disease_cases.sort_values('Case_Count', ascending=False)
    
    # Recent trends (last 30 days by disease)
    recent_30 = df_global[df_global['Date'] >= df_global['Date'].max() - timedelta(days=30)]
    disease_trends = recent_30.groupby(['Date', 'Disease'])['Case_Count'].sum().reset_index()
    disease_trends['Date'] = disease_trends['Date'].dt.strftime('%Y-%m-%d')
    
    # Statistics
    total_cases = int(df_global['Case_Count'].sum())
    avg_daily_cases = int(df_global.groupby('Date')['Case_Count'].sum().mean())
    active_regions = int(df_global['Region'].nunique())
    tracked_diseases = int(df_global['Disease'].nunique())
    
    return jsonify({
        'daily_trend': daily_cases.to_dict('records'),
        'regional_distribution': regional_cases.to_dict('records'),
        'disease_distribution': disease_cases.to_dict('records'),
        'disease_trends': disease_trends.to_dict('records'),
        'statistics': {
            'total_cases': total_cases,
            'avg_daily_cases': avg_daily_cases,
            'active_regions': active_regions,
            'tracked_diseases': tracked_diseases
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Generate predictions using ML model"""
    # Using Gemini API instead of local model
    
    try:
        data = request.json
        
        # Extract parameters
        region = data.get('region', 'Asia')
        disease = data.get('disease', 'Dengue')
        temperature = float(data.get('temperature', 28.0))
        rainfall = float(data.get('rainfall', 150.0))
        humidity = float(data.get('humidity', 70.0))
        population_density = int(data.get('population_density', 1000))
        days_ahead = int(data.get('days_ahead', 30))
        
        # Generate predictions for next N days
        predictions = []
        base_date = datetime.now()
        
        use_gemini = True
        if not api_key:
            use_gemini = False
            
        if use_gemini:
            try:
                prompt = f"""
                You are an AI specialized in epidemiological forecasting.
                Provide a daily predicted case count for {disease} in {region} over the next {days_ahead} days.
                Current conditions:
                - Temperature: {temperature} C
                - Rainfall: {rainfall} mm
                - Humidity: {humidity} %
                - Population Density: {population_density} person/sq.km
                
                Output a JSON array of {days_ahead} integers representing predicted cases for each day.
                Example format: [15, 18, 20, 16]
                Make sure the output strictly follows the schema. Ensure there are exactly {days_ahead} numbers in the array.
                """
                
                response = gemini_model.generate_content(prompt)
                
                # Clean potential markdown formatting
                raw_text = response.text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                    
                predicted_cases_list = json.loads(raw_text.strip())
                
                if not isinstance(predicted_cases_list, list):
                    predicted_cases_list = [10] * days_ahead # Fallback
                    
                if len(predicted_cases_list) != days_ahead:
                    if len(predicted_cases_list) == 0:
                        predicted_cases_list = [10] * days_ahead
                    predicted_cases_list = (predicted_cases_list * (days_ahead // len(predicted_cases_list) + 1))[:days_ahead]

                for day in range(days_ahead):
                    pred_date = base_date + timedelta(days=day)
                    
                    # Add some variation to environmental factors
                    temp_var = temperature + np.random.normal(0, 2)
                    rain_var = max(0, rainfall + np.random.normal(0, 20))
                    humid_var = max(40, min(90, humidity + np.random.normal(0, 3)))
                    
                    predictions.append({
                        'date': pred_date.strftime('%Y-%m-%d'),
                        'predicted_cases': int(predicted_cases_list[day]),
                        'temperature': round(temp_var, 2),
                        'rainfall': round(rain_var, 2)
                    })
            except Exception as e:
                print(f"Gemini API predict failed: {e}. Falling back to local model.")
                use_gemini = False  # Trigger fallback
                predictions = []    # clear any partial predictions
                
        if not use_gemini:
            # Fallback to local model
            if not forecaster.is_trained:
                raise ValueError("Local ML Model is not trained and Gemini API is unavailable.")
                
            for day in range(days_ahead):
                pred_date = base_date + timedelta(days=day)
                
                # Add some variation to environmental factors
                temp_var = temperature + np.random.normal(0, 2)
                rain_var = max(0, rainfall + np.random.normal(0, 20))
                humid_var = max(40, min(90, humidity + np.random.normal(0, 3)))
                
                predicted_cases = forecaster.predict(
                    region=region,
                    disease=disease,
                    temperature=temp_var,
                    rainfall=rain_var,
                    humidity=humid_var,
                    population_density=population_density,
                    date=pred_date.strftime('%Y-%m-%d')
                )
                
                predictions.append({
                    'date': pred_date.strftime('%Y-%m-%d'),
                    'predicted_cases': predicted_cases,
                    'temperature': round(temp_var, 2),
                    'rainfall': round(rain_var, 2)
                })
        
        return jsonify({
            'predictions': predictions,
            'parameters': {
                'region': region,
                'disease': disease,
                'base_temperature': temperature,
                'base_rainfall': rainfall,
                'humidity': humidity,
                'population_density': population_density
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/regions')
def get_regions():
    """Get list of available regions"""
    if df_global is None:
        return jsonify({'error': 'Data not available'}), 500
    
    regions = sorted(df_global['Region'].unique().tolist())
    return jsonify({'regions': regions})

@app.route('/api/diseases')
def get_diseases():
    """Get list of tracked diseases"""
    if df_global is None:
        return jsonify({'error': 'Data not available'}), 500
    
    diseases = sorted(df_global['Disease'].unique().tolist())
    return jsonify({'diseases': diseases})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chatbot endpoint to explain the dashboard"""
    try:
        data = request.json
        user_message = data.get('message', '')
        context_data = data.get('context', {})
        
        # Prepare a context-aware prompt using dashboard stats
        prompt = f"""
You are an expert epidemiological data analyst assistant integrated into the "Global Health Monitor" dashboard.
The user is viewing the dashboard and asks a question. Explain trends, give insights, and answer their questions based ONLY on the following current dashboard data and your general knowledge in epidemiology.

Dashboard Context:
- Total Cases: {context_data.get('total_cases', 'Unknown')}
- Active Regions: {context_data.get('active_regions', 'Unknown')}
- Tracked Diseases: {context_data.get('tracked_diseases', 'Unknown')}
- Average Daily Cases: {context_data.get('avg_daily_cases', 'Unknown')}

User Question: {user_message}

Provide a concise, helpful, and analytical response. Format your response in plain text or simple markdown.
        """
        
        # If API Key is present, try to use it
        if api_key:
            try:
                response = gemini_model.generate_content(prompt)
                return jsonify({'response': response.text})
            except Exception as e:
                return jsonify({'response': f"The AI Chatbot encountered an error: {str(e)}. Please check your API settings."})
        else:
            # Fallback offline response when no API key is available
            offline_response = f"""
**Offline Analytics Assistant:**
I am currently operating in offline mode. However, I can still observe the following from your dashboard:

- **Total Cases:** {context_data.get('total_cases', 'Unknown')}
- **Active Regions:** {context_data.get('active_regions', 'Unknown')}
- **Tracked Diseases:** {context_data.get('tracked_diseases', 'Unknown')}
- **Average Daily Cases:** {context_data.get('avg_daily_cases', 'Unknown')}

Your question was: "{user_message}"
"""
            return jsonify({'response': offline_response})

    except Exception as e:
        return jsonify({'response': f"Error: {str(e)}"})

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 Disease Analysis & Forecasting Platform")
    print("="*60)
    print("Starting Flask server...")
    print("Dashboard: http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
