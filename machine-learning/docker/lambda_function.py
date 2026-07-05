import json
import boto3
import onnxruntime as ort 
import numpy as np
import os
import datetime
from decimal import Decimal
import requests
import uuid

# Initialise AWS Clients
dynamodb = boto3.resource('dynamodb')

# Configuration
APPSYNC_URL = "YOUR_APPSYNC_ENDPOINT_HERE"  # Replace with your actual AppSync endpoint
API_KEY = "YOUR_APPSYNC_API_KEY_HERE"  # Replace with your actual AppSync API key
TABLE_NAME = "YOUR_DYNAMODB_TABLE_NAME_HERE"  # Replace with your actual DynamoDB table name
MODEL_PATH = os.path.join(os.environ['LAMBDA_TASK_ROOT'], 'lstm_autoencoder.onnx')
WINDOW_SIZE = 140
THRESHOLD = 0.8
# Load the model Once when the container starts (cold start)
# This makes subsequent heartbeats process in milliseconds
try:
    session = ort.InferenceSession(MODEL_PATH)
    print("Model loaded successfully from: ", MODEL_PATH)
except Exception as e:
    print(f"CRITICAL: Failed to load model during init: {str(e)}")


def lambda_handler(event, context):
    try:
        
        # Data extraction
        record_id = event.get('id')
        patient_id = event.get('patientId')

        print(f"DEBUG: Processing ecg for patient: {patient_id}, Record ID: {record_id}")
        if not patient_id:
            print("No patientId found in event payload!")
            patient_id = 'unknown_patient'

        raw_waveform = event.get('ecgWaveform', [])

        if not raw_waveform:
            print("No waveform found")
            return {'statusCode': 200, 'body': 'No data'}
        
        clean_ecg = [float(x) for x in raw_waveform]
 

        # Sliding Window Logic:
        any_anomaly = False 
        all_mae_scores = []

        input_name = session.get_inputs()[0].name

        # Slide through the incoming 500 points to a 140 windows
        for i in range(0, len(clean_ecg) - WINDOW_SIZE + 1, WINDOW_SIZE):
            window = np.array(clean_ecg[i:i + WINDOW_SIZE], dtype=np.float32).reshape(1, WINDOW_SIZE, 1)

            # run inference
            outputs = session.run(None, {input_name: window})

            # Calculate MAE for this window
            reconstruction = outputs[0]
            mae = np. mean(np.abs(window - reconstruction))
            all_mae_scores.append(float(mae))

            # if any window is anomalous, flag the whole record
            if mae > THRESHOLD:
                any_anomaly = True 
                
        
        # Aggregate Results
        is_anomaly = bool(any_anomaly)
        # Use the maximum MAE found as the representative score for hte batch
        final_mae = max(all_mae_scores) if all_mae_scores else 0.0


        # APPSYNC MUTATION
        mutation = """ 
        mutation CreateEcgData($input: CreateEcgDataInput!) {
            createEcgData(input: $input) {
                id
                patientId
                ecgWaveform
                timestamp
                is_anomaly
                anomaly_score
                createdAt
                updatedAt
                __typename
            }
        }"""

        current_time_int = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        variables = {
            "input": {
                "id": record_id,
                "patientId": patient_id,
                "ecgWaveform": clean_ecg,
                "timestamp": current_time_int,
                "is_anomaly": is_anomaly,
                "anomaly_score": float(final_mae),
            }
        }

        headers = {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        }

        
        try:
            response = requests.post(
                APPSYNC_URL,
                json={'query': mutation, 'variables': variables},
                headers=headers
            )
            print(f"AppSync Triggered: {response.status_code}")

            
            result = response.json()
            if 'errors' in result:
                print(f"AppSync Schema Error: {result['errors']}")
            else:
                print(f"SUCCESS: Data sent to AppSync and DynamoDB")    

        except Exception as e:
            print(f"Appsync Failed: {str(e)}")


    
        return {
            'statusCode': 200,
            'body': json.dumps('Complete'),
        }
        
    except Exception as e:
        print(f"Lambda Error: {str(e)}")
        return {'statusCode': 500, 'error': str(e)}
