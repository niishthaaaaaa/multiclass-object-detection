from pathlib import Path
import os

# Default model path; change to your model file path or set MODEL_PATH env var
MODEL_PATH = os.environ.get("MODEL_PATH", str(Path(__file__).parent.parent / "models" / "best_model_backup.onnx"))

# Inference settings
CONF_THRESH = float(os.environ.get("CONF_THRESH", 0.25))
DEVICE = os.environ.get("DEVICE", "cuda" if os.environ.get("USE_CUDA","1")=="1" else "cpu")
