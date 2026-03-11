"""
Data Generator for Disease Analysis Platform
Generates synthetic regional disease data with environmental factors
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

def generate_disease_data(num_records=5000):
    """Generate synthetic disease outbreak data"""
    
    # Define regions
    regions = [
        'North America', 'South America', 'Europe', 'Asia', 
        'Africa', 'Oceania', 'Middle East', 'Southeast Asia'
    ]
    
    # Define disease types
    diseases = [
        'Influenza', 'Dengue', 'Malaria', 'Cholera', 
        'Tuberculosis', 'COVID-19', 'Measles', 'Typhoid'
    ]
    
    # Generate date range (last 3 years)
    start_date = datetime.now() - timedelta(days=3*365)
    dates = [start_date + timedelta(days=x) for x in range(num_records)]
    
    data = []
    
    for i in range(num_records):
        region = random.choice(regions)
        disease = random.choice(diseases)
        date = dates[i]
        
        # Environmental factors with seasonal patterns
        month = date.month
        
        # Temperature varies by season (15-35°C)
        base_temp = 25
        seasonal_temp = 10 * np.sin(2 * np.pi * month / 12)
        temperature = base_temp + seasonal_temp + np.random.normal(0, 3)
        
        # Rainfall varies by season (0-300mm)
        base_rain = 100
        seasonal_rain = 80 * np.sin(2 * np.pi * (month - 3) / 12)
        rainfall = max(0, base_rain + seasonal_rain + np.random.normal(0, 30))
        
        # Humidity (40-90%)
        humidity = 65 + 15 * np.sin(2 * np.pi * month / 12) + np.random.normal(0, 5)
        humidity = max(40, min(90, humidity))
        
        # Population density (per km²)
        population_density = random.choice([50, 150, 300, 500, 1000, 2000, 5000])
        
        # Case count influenced by environmental factors
        # Different diseases have different correlations
        if disease in ['Dengue', 'Malaria']:
            # Water-borne diseases correlate with rainfall
            base_cases = 10 + 0.3 * rainfall + 0.2 * temperature
        elif disease in ['Influenza', 'COVID-19', 'Measles']:
            # Respiratory diseases correlate with lower temperatures
            base_cases = 50 - 0.5 * temperature + 0.001 * population_density
        elif disease in ['Cholera', 'Typhoid']:
            # Sanitation-related diseases
            base_cases = 5 + 0.2 * rainfall + 0.0005 * population_density
        else:
            base_cases = 20 + 0.1 * temperature
        
        # Add random variation and ensure positive
        cases = max(0, int(base_cases + np.random.normal(0, base_cases * 0.3)))
        
        data.append({
            'Date': date.strftime('%Y-%m-%d'),
            'Region': region,
            'Disease': disease,
            'Temperature_C': round(temperature, 2),
            'Rainfall_mm': round(rainfall, 2),
            'Humidity_Percent': round(humidity, 2),
            'Population_Density': population_density,
            'Case_Count': cases
        })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Sort by date
    df = df.sort_values('Date').reset_index(drop=True)
    
    return df

if __name__ == '__main__':
    print("Generating synthetic disease data...")
    df = generate_disease_data(5000)
    
    # Save to CSV
    output_file = 'disease_data.csv'
    df.to_csv(output_file, index=False)
    
    print(f"✓ Generated {len(df)} records")
    print(f"✓ Saved to {output_file}")
    print(f"\nData Summary:")
    print(f"  Date Range: {df['Date'].min()} to {df['Date'].max()}")
    print(f"  Regions: {df['Region'].nunique()}")
    print(f"  Diseases: {df['Disease'].nunique()}")
    print(f"  Total Cases: {df['Case_Count'].sum():,}")
    print(f"\nFirst few records:")
    print(df.head(10))
