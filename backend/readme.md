# API call for prediction

### Endpoint for POST

http://127.0.0.1:8000/api/

### Example call

Make a **POST** call with the file in **form data** with key as **audio** and value as the **audio file**



### Example response

```json
{
    "status": "success",
    "prediction": "abnormal",
    "confidence": 0.8517261147499084,
    "probabilities": {
        "normal": 0.14827388525009155,
        "abnormal": 0.8517261147499084
    }
}
```

# How to run

#### First CD inside backend

```bash 
cd backend
```

### Initialize a Python Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
brew install libomp
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the FastAPI Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Or specify host and port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Deactivate Virtual Environment

```bash
deactivate
```
