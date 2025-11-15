import http
import json
import joblib
import numpy as np
import librosa
import tensorflow_hub as hub
import soundfile as sf
import io
import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the project root and find the model
modelLocation = os.path.join(os.path.dirname(BASE_DIR), "classifier_xgb.joblib")

SAMPLE_RATE = 16000
model = None
yamnet = None



@app.on_event("startup")
async def load_model():
    global model, yamnet
    try:
        model = joblib.load(modelLocation)
        print(f"Model loaded successfully from {modelLocation}")
        
        yamnet = hub.load('https://tfhub.dev/google/yamnet/1')
        print("YAMNet loaded successfully")
    except Exception as e:
        error_msg = str(e)
        print(f"Error loading model: {error_msg}")
        
        # Provide helpful message for common macOS issue
        if "libomp" in error_msg.lower() and "darwin" in os.uname().sysname.lower():
            print("\n⚠️  macOS users: XGBoost requires OpenMP runtime.")
            print("Install it with: brew install libomp")
            print("Then restart the server.\n")
        
        raise



def extract_yamnet_features(audio_data: bytes) -> np.ndarray:
    """Extract YAMNet embeddings from audio data."""
    # Load audio from bytes
    audio_io = io.BytesIO(audio_data)
    sig, sr = sf.read(audio_io, dtype='float32')
    
    # Convert stereo to mono if needed
    if sig.ndim > 1:
        sig = sig.mean(axis=1)
    
    # Resample to 16kHz if needed
    if sr != SAMPLE_RATE:
        sig = librosa.resample(sig, orig_sr=sr, target_sr=SAMPLE_RATE)
    
    # Ensure minimum length
    if len(sig) < 1600:  # 0.1 seconds at 16kHz
        sig = np.pad(sig, (0, 1600 - len(sig)))
    
    # Get YAMNet embeddings
    scores, embeddings, spectrogram = yamnet(sig.astype(np.float32))
    
    # Average embeddings across time to get single feature vector
    emb_avg = embeddings.numpy().mean(axis=0)  # Shape: (1024,)
    
    return emb_avg.reshape(1, -1)  # Shape: (1, 1024)



@app.post("/api/")
async def predictBreathing(audio: UploadFile = File(...)):
    try:
        if model is None or yamnet is None:
            raise HTTPException(status_code=http.HTTPStatus.SERVICE_UNAVAILABLE, detail="Model not loaded")
        
        if audio.content_type not in ["audio/wav", "audio/mpeg", "audio/x-wav"]:
            raise HTTPException(status_code=http.HTTPStatus.UNSUPPORTED_MEDIA_TYPE, detail="Unsupported file type")

        # Read audio file
        audio_data = await audio.read()
        
        # Extract features
        features = extract_yamnet_features(audio_data)
        
        # Make prediction
        prediction_class = model.predict(features)[0]
        prediction_proba = model.predict_proba(features)[0]
        
        # Map to labels
        prediction = "abnormal" if prediction_class == 1 else "normal"
        confidence = float(prediction_proba[prediction_class])

        response = {
            "status": "success",
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": {
                "normal": float(prediction_proba[0]),
                "abnormal": float(prediction_proba[1])
            }
        }
        return JSONResponse(content=response)

    except Exception as e:
        response = {
            "status": "error",
            "message": str(e)
        }
        return JSONResponse(status_code=http.HTTPStatus.INTERNAL_SERVER_ERROR, content=response)
