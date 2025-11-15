# How to run

### Initialize a Python Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install FastAPI and Uvicorn manually:

```bash
pip install fastapi uvicorn
```

### Run the FastAPI Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Or specify host and port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Access the API

- **API Base URL**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc


### Deactivate Virtual Environment

```bash
deactivate
```

# Respiratory Sound Classification API

## Setup Instructions

### Prerequisites

#### macOS Users
Install OpenMP runtime (required for XGBoost):
```bash
brew install libomp
```

#### Linux Users
OpenMP is usually pre-installed. If not:
```bash
sudo apt-get install libgomp1  # Ubuntu/Debian
# or
sudo yum install libgomp  # CentOS/RHEL
```

#### Windows Users
OpenMP runtime is typically included with Python packages.

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## Testing

Access the interactive API docs at `http://127.0.0.1:8000/docs`
