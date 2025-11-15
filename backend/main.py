import http
import json
import joblib
import numpy as np
import librosa
import tensorflow_hub as hub
import soundfile as sf
import io
import os
from pydub import AudioSegment
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from gemini import gemini

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        if "ffmpeg" in error_msg.lower():
            print("\n All users: pydub requires ffmpeg to handle certain audio formats.")
            print("Check how to install ffmpeg for your OS in readme.md")
            print("Then restart the server.\n")
        if "libomp" in error_msg.lower() and "darwin" in os.uname().sysname.lower():
            print("\nmacOS users: XGBoost requires OpenMP runtime.")
            print("Install it with: brew install libomp")
            print("Then restart the server.\n")
        
        raise



def extract_yamnet_features(audio_data: bytes) -> np.ndarray:
    """Extract YAMNet embeddings from audio data."""
    try:
        # Try to load with soundfile first (handles WAV, FLAC, OGG)
        audio_io = io.BytesIO(audio_data)
        sig, sr = sf.read(audio_io, dtype='float32')
    except Exception as e:
        print(f"soundfile failed, trying pydub for WebM/other formats: {e}")
        # If soundfile fails, use pydub to convert to WAV first (handles WebM, MP3, etc.)
        try:
            audio_io = io.BytesIO(audio_data)
            audio_segment = AudioSegment.from_file(audio_io)
            
            # Convert to WAV in memory
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format='wav')
            wav_io.seek(0)
            
            # Now load with soundfile
            sig, sr = sf.read(wav_io, dtype='float32')
        except Exception as e2:
            print(f"pydub also failed: {e2}")
            raise HTTPException(
                status_code=http.HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                detail=f"Could not decode audio file. Ensure it's a valid audio format. Error: {str(e2)}"
            )
    
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
        
        # Generate Gemini recommendation
        abnormal_prob = float(prediction_proba[1])
        gemini_prompt = f"""Based on a respiratory audio analysis with {abnormal_prob*100:.1f}% probability of abnormal breathing patterns, 
        provide a brief recommendation about whether the user should be concerned and what actions they should take. 
        Consider: if probability is below 30% - reassuring, 30-60% - monitor, 60-80% - should consult doctor, above 80% - seek medical attention soon."""
        
        recommendation = gemini(gemini_prompt)
        if recommendation is None:
            # Fallback recommendations based on abnormal probability
            if abnormal_prob >= 0.75:
                recommendation = "Your breathing pattern shows significant abnormalities. We strongly recommend consulting with a healthcare professional as soon as possible for a proper evaluation."
            elif abnormal_prob >= 0.30:
                recommendation = "Your breathing pattern shows some irregularities. Consider monitoring your symptoms and consult a doctor if you experience any discomfort or worsening of symptoms."
            else:
                recommendation = "Your breathing pattern appears normal. Continue maintaining good respiratory health through regular exercise and proper breathing techniques."

        response = {
            "status": "success",
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": {
                "normal": float(prediction_proba[0]),
                "abnormal": float(prediction_proba[1])
            },
            "recommendation": recommendation
        }
        print(f"Response: {response}")
        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        response = {
            "status": "error",
            "message": str(e)
        }
        return JSONResponse(status_code=http.HTTPStatus.INTERNAL_SERVER_ERROR, content=response)
