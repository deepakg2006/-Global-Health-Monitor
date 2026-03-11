"""
Machine Learning Engine for Disease Forecasting
Uses Random Forest Regressor to predict disease case counts
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import json

class DiseaseForecaster:
    """ML model for predicting disease case counts"""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        self.region_encoder = LabelEncoder()
        self.disease_encoder = LabelEncoder()
        self.feature_names = []
        self.is_trained = False
        
    def prepare_features(self, df, fit_encoders=False):
        """Prepare features for training or prediction"""
        df = df.copy()
        
        # Extract date features
        df['Date'] = pd.to_datetime(df['Date'])
        df['Year'] = df['Date'].dt.year
        df['Month'] = df['Date'].dt.month
        df['DayOfYear'] = df['Date'].dt.dayofyear
        df['Quarter'] = df['Date'].dt.quarter
        
        # Encode categorical variables
        if fit_encoders:
            df['Region_Encoded'] = self.region_encoder.fit_transform(df['Region'])
            df['Disease_Encoded'] = self.disease_encoder.fit_transform(df['Disease'])
        else:
            df['Region_Encoded'] = self.region_encoder.transform(df['Region'])
            df['Disease_Encoded'] = self.disease_encoder.transform(df['Disease'])
        
        # Select features
        feature_cols = [
            'Year', 'Month', 'DayOfYear', 'Quarter',
            'Region_Encoded', 'Disease_Encoded',
            'Temperature_C', 'Rainfall_mm', 'Humidity_Percent',
            'Population_Density'
        ]
        
        self.feature_names = feature_cols
        
        X = df[feature_cols]
        y = df['Case_Count'] if 'Case_Count' in df.columns else None
        
        return X, y
    
    def train(self, data_file='disease_data.csv'):
        """Train the model on historical data"""
        print("Loading data...")
        df = pd.read_csv(data_file)
        
        print(f"Preparing features from {len(df)} records...")
        X, y = self.prepare_features(df, fit_encoders=True)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print("Training Random Forest model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_pred = self.model.predict(X_train)
        test_pred = self.model.predict(X_test)
        
        train_mse = mean_squared_error(y_train, train_pred)
        test_mse = mean_squared_error(y_test, test_pred)
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        test_mae = mean_absolute_error(y_test, test_pred)
        
        print(f"\n✓ Model Training Complete!")
        print(f"  Train MSE: {train_mse:.2f}")
        print(f"  Test MSE: {test_mse:.2f}")
        print(f"  Train R²: {train_r2:.4f}")
        print(f"  Test R²: {test_r2:.4f}")
        print(f"  Test MAE: {test_mae:.2f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'Feature': self.feature_names,
            'Importance': self.model.feature_importances_
        }).sort_values('Importance', ascending=False)
        
        print(f"\nTop 5 Important Features:")
        print(feature_importance.head())
        
        self.is_trained = True
        
        return {
            'train_mse': float(train_mse),
            'test_mse': float(test_mse),
            'train_r2': float(train_r2),
            'test_r2': float(test_r2),
            'test_mae': float(test_mae)
        }
    
    def predict(self, region, disease, temperature, rainfall, humidity, population_density, date):
        """Predict case count for given parameters"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Create input dataframe
        input_data = pd.DataFrame([{
            'Date': date,
            'Region': region,
            'Disease': disease,
            'Temperature_C': temperature,
            'Rainfall_mm': rainfall,
            'Humidity_Percent': humidity,
            'Population_Density': population_density,
            'Case_Count': 0  # Placeholder
        }])
        
        X, _ = self.prepare_features(input_data, fit_encoders=False)
        prediction = self.model.predict(X)[0]
        
        return max(0, int(prediction))
    
    def save_model(self, filepath='disease_model.pkl'):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'region_encoder': self.region_encoder,
            'disease_encoder': self.disease_encoder,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, filepath)
        print(f"✓ Model saved to {filepath}")
    
    def load_model(self, filepath='disease_model.pkl'):
        """Load trained model from disk"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.region_encoder = model_data['region_encoder']
        self.disease_encoder = model_data['disease_encoder']
        self.feature_names = model_data['feature_names']
        self.is_trained = True
        print(f"✓ Model loaded from {filepath}")

if __name__ == '__main__':
    # Train and save model
    forecaster = DiseaseForecaster()
    metrics = forecaster.train('disease_data.csv')
    forecaster.save_model('disease_model.pkl')
    
    # Test prediction
    print("\n--- Testing Prediction ---")
    test_prediction = forecaster.predict(
        region='Asia',
        disease='Dengue',
        temperature=30.5,
        rainfall=250.0,
        humidity=80.0,
        population_density=2000,
        date='2026-06-15'
    )
    print(f"Predicted cases for Dengue in Asia (June 2026): {test_prediction}")
