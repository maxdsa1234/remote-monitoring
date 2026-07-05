import onnx

model_path = "lstm_autoencoder.onnx"
model = onnx.load(model_path)

print(f"Old IR version: {model.ir_version}")
model.ir_version = 9
print(f"New IR version: {model.ir_version}")

onnx.save(model, "lstm_autoencoder.onnx")
print("Model downgraded successfully!")