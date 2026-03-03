FastAPI backend for model inference.
Run:
  cd backend
  python -m venv env
  .\env\Scripts\Activate.ps1     # on Windows PowerShell
  pip install -r requirements.txt
  # put your model file (model_best.pt or best_model_backup.pt or .onnx) in backend\models
  setx MODEL_PATH "backend\models\model_best.pt"
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
