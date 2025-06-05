import cv2
import numpy as np
import json
import os
import math
from collections import defaultdict

def analyze_earth_texture(image_path='earth_texture.jpg', output_path='earth_regions.json'):
    """
    Analyzes the earth texture image to identify land and water regions
    and generates a mapping of grid cells to geographic features.
    """
    print(f"Analyzing earth texture from {image_path}...")
    
    # Check if the image exists
    if not os.path.exists(image_path):
        print(f"Error: Image file {image_path} not found")
        return False
    
    # Load image
    try:
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not load image {image_path}")
            return False
        
        # Convert to RGB (OpenCV loads as BGR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Get dimensions
        height, width, _ = img.shape
        print(f"Image dimensions: {width}x{height}")
    except Exception as e:
        print(f"Error loading image: {e}")
        return False
    
    # Create grid
    grid_width = 48  # Number of longitude cells (2x the segments in the THREE.js grid)
    grid_height = 24  # Number of latitude cells
    
    # Region data structure
    regions = {}
    
    # Helper function to classify color
    def classify_pixel(pixel):
        r, g, b = pixel
        
        # Deep blue = ocean
        if b > 150 and r < 100 and g < 130:
            return "ocean"
        # Lighter blue = shallow water
        elif b > 150 and r > 100 and g > 130:
            return "shallow_water"
        # White = ice/snow
        elif r > 200 and g > 200 and b > 200:
            return "ice"
        # Green = vegetation
        elif g > 120 and g > r and g > b:
            return "vegetation"
        # Brown/tan = desert/mountains
        elif r > 150 and g > 100 and b < 100:
            return "desert"
        # Other
        else:
            return "land"
    
    print("Analyzing grid cells...")
    for y in range(grid_height):
        for x in range(grid_width):
            # Calculate cell boundaries in image
            cell_x_start = int(x * width / grid_width)
            cell_x_end = int((x + 1) * width / grid_width)
            
            # Invert y because image 0,0 is top-left but geographic grid is bottom-up
            cell_y_start = int((grid_height - y - 1) * height / grid_height)
            cell_y_end = int((grid_height - y) * height / grid_height)
            
            # Sample pixels from this cell
            cell_img = img[cell_y_start:cell_y_end, cell_x_start:cell_x_end]
            pixels = cell_img.reshape(-1, 3)
            
            # Calculate feature distribution
            features = defaultdict(int)
            for pixel in pixels:
                feature = classify_pixel(pixel)
                features[feature] += 1
            
            # Normalize to percentages
            total_pixels = len(pixels)
            features = {k: round(v / total_pixels * 100, 1) for k, v in features.items()}
            
            # Calculate geographic coordinates of cell center
            # Longitude: -180 to 180, with -180 at x=0 and 180 at x=grid_width
            longitude = (x / grid_width * 360) - 180
            
            # Latitude: 90 to -90, with 90 at y=0 and -90 at y=grid_height
            latitude = 90 - (y / grid_height * 180)
            
            # Determine primary feature
            primary_feature = max(features.items(), key=lambda x: x[1])[0]
            
            # Determine region name based on features and coordinates
            region_name = determine_region(longitude, latitude, features)
            
            # Store cell data
            regions[f"{x}_{y}"] = {
                "cell_id": f"{x}_{y}",
                "grid_x": x,
                "grid_y": y,
                "longitude": round(longitude, 2),
                "latitude": round(latitude, 2),
                "primary_feature": primary_feature,
                "features": features,
                "region": region_name
            }
            
            # Progress report every 100 cells
            if (y * grid_width + x) % 100 == 0:
                print(f"Processed {y * grid_width + x} cells...")
    
    # Save to JSON file
    try:
        with open(output_path, 'w') as f:
            json.dump({"grid_size": {"width": grid_width, "height": grid_height}, "cells": regions}, f, indent=2)
        print(f"Successfully saved data to {output_path}")
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def determine_region(longitude, latitude, features):
    """
    Determine region name based on coordinates and features
    This is a simplified version that could be expanded with more detailed region mapping
    """
    # Simple continental regions based on longitude/latitude
    if latitude > 66:
        return "Arctic"
    elif latitude < -66:
        return "Antarctica"
    
    # North America
    elif longitude < -30 and longitude > -170 and latitude > 15:
        if features.get("ice", 0) > 30:
            return "Greenland"
        elif longitude < -140:
            return "Alaska"
        elif longitude < -50:
            return "North America"
        else:
            return "Canada"
    
    # South America
    elif longitude < -30 and longitude > -90 and latitude < 15 and latitude > -60:
        return "South America"
    
    # Europe
    elif longitude > -10 and longitude < 40 and latitude > 35:
        return "Europe"
    
    # Africa
    elif longitude > -20 and longitude < 55 and latitude < 35 and latitude > -35:
        if features.get("desert", 0) > 40:
            return "Sahara Desert"
        return "Africa"
    
    # Asia
    elif longitude > 40 and longitude < 150 and latitude > 0:
        if latitude > 50 and longitude > 60:
            return "Siberia"
        elif longitude > 90 and longitude < 135 and latitude > 20 and latitude < 40:
            return "China"
        elif longitude > 65 and longitude < 90 and latitude > 5 and latitude < 35:
            return "India"
        elif longitude > 120 and latitude > 30:
            return "Japan"
        return "Asia"
    
    # Australia
    elif longitude > 110 and longitude < 155 and latitude < 0 and latitude > -40:
        return "Australia"
    
    # Pacific Ocean
    elif (longitude > 150 or longitude < -120) and latitude < 50 and latitude > -50:
        return "Pacific Ocean"
    
    # Atlantic Ocean
    elif longitude > -60 and longitude < 0 and latitude < 50 and latitude > -50:
        return "Atlantic Ocean"
    
    # Indian Ocean
    elif longitude > 40 and longitude < 110 and latitude < 20 and latitude > -50:
        return "Indian Ocean"
    
    # Default to using the primary feature as a generic region name
    else:
        if features.get("ocean", 0) > 50:
            return "Ocean"
        elif features.get("ice", 0) > 30:
            return "Ice Cap"
        elif features.get("desert", 0) > 40:
            return "Desert"
        elif features.get("vegetation", 0) > 40:
            return "Forest"
        else:
            return "Land"

if __name__ == "__main__":
    analyze_earth_texture()
    print("Done! The earth_regions.json file can now be used by the web application.")