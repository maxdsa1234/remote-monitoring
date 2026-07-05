import onnxruntime as ort
import numpy as np
import os

MODEL_PATH = "lstm_autoencoder.onnx"
THRESHOLD = 0.25

def run_unit_test():
    print("Starting Unit Test for LSTM Autoencoder ONNX Model")

    try:
        session = ort.InferenceSession(MODEL_PATH)
        input_name = session.get_inputs()[0].name
        print(f"Model loaded successfully. Input name: {input_name}")
    except Exception as e:
        print(f"FAILED: COULD NOT LOAD MODEL: {e}")
        return 
    
    # Case A: Normal Data
    normal_data = np.zeros((1,140,1), dtype=np.float32)  # Shape: (1, 140, 1)
    normal_output = session.run(None, {input_name: normal_data})
    normal_mae = np.mean(np.abs(normal_data - normal_output[0]))

    # Case B: Anomalous Data 
    anomalous_data = np.random.uniform(low=-5.0, high=5.0, size=(1,140,1)).astype(np.float32)  # Shape: (1, 140, 1)
    anomalous_output = session.run(None, {input_name: anomalous_data})
    anomalous_mae = np.mean(np.abs(anomalous_data - anomalous_output[0]))

    # Validation Logic 
    print(f"\nResults")
    print(f"Normal MAE: {normal_mae:.4f} (Expected: < {THRESHOLD})")
    print(f"Anomalous MAE: {anomalous_mae:.4f} (Expected: > {THRESHOLD})")

    if normal_mae < THRESHOLD and anomalous_mae > THRESHOLD:
        print("\n CONCLUSION: UNIT TEST PASSED")
        print("Model is correctly distinguishing between normal and anomalous data.")
    else:
        print("\n CONCLUSION: UNIT TEST FAILED")

if __name__ == "__main__":
    run_unit_test()