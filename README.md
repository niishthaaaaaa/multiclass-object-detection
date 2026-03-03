## Project Context

This repository is my maintained and continuously improving version of Detects7, originally developed as a collaborative team project.

### My Contributions
- Contributed to model training and evaluation
- Worked on backend integration (FastAPI)
- Assisted in frontend–backend connection
- Participated in deployment and testing
 
 
 
 
 
 
 # Detects7

**Team:** Code Enforcers

![mAP50](https://img.shields.io/badge/mAP50-75.23%25-brightgreen)
![mAP50-95](https://img.shields.io/badge/mAP50--95-60.3%25-yellow)
![epochs](https://img.shields.io/badge/Epochs-150-blue)
![Model](https://img.shields.io/badge/Model-YOLOv8-success)
![Backend](https://img.shields.io/badge/Backend-FastAPI-0A7ACC)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)
![Build](https://img.shields.io/badge/Build-Vite-646CFF)
![Language](https://img.shields.io/badge/Python-3.10-blue)
![JS](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Framework](https://img.shields.io/badge/Ultralytics-YOLO-red)

---

## Summary

Detects7 is a web + API demo and research prototype for detecting seven safety-related object classes. It was trained on the Falcon synthetic dataset and deployed with a FastAPI backend and a Vite + React frontend. The project is designed to be simple to run locally and to serve as a foundation for further experiments.

## Team

| Name        |                                            GitHub | Role                                                                                                            |
| ----------- | ------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------- |
| Akash Kumar |           [XynaxDev](https://github.com/XynaxDev) | Project lead — directs model development, tunes experiments and hyperparameters, and manages API integration for deployment. |
| Lavnish     |             [lavn1sh](https://github.com/lavn1sh) | Frontend & integration engineer — builds the web interface and connects the ML outputs to the UI and backend.                |
| Nishtha     | [niishthaaaaaa](https://github.com/niishthaaaaaa) | Model engineer — runs training experiments, prepares and curates the dataset, and iterates on model performance.             |
| Himanshi    |   [Himanshi1531](https://github.com/Himanshi1531) | Research lead — surveys literature, recommends improvements, and helps shape experiment design.                              |

*App name:* *Detects7* — Team: **Code Enforcers**

*Table: Code Enforcers — team roles and responsibilities.*

## Key results

*Final metrics taken from `ml/exp12/results.csv` (final epoch = 150).*

| Metric          |                                                   Value |
| --------------- | ------------------------------------------------------: |
| Precision       |                                                 0.91082 |
| Recall          |                                                 0.67942 |
| mAP@50          |                                                 0.75223 |
| mAP@50:95       |                                                 0.60106 |
| Training epochs |                                                     150 |
| Best checkpoint | `ml/exp12/weights/best.pt` (also exported in `models/`) |

> The `evaluate.py` script generates `evaluation_summary.json` and a confusion matrix for an official summary.

## Repository layout (important files & folders)

| Path           | What it contains                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/`     | FastAPI backend (see `backend/app/` for `main.py`, `model_loader.py`, `utils.py`, `config.py`)                                                 |
| `frontend/`    | Vite + React UI (`src/` contains `App.jsx`, `main.jsx`, components, styles)                                                                    |
| `ml/`          | Training and evaluation code, dataset config and experiments (`yolo_params.yaml`, `train_yolo.py`, `evaluate.py`, `predict_user.py`, `exp12/`) |
| `models/`      | Deployment artifacts (`best_model_backup.pt`, `best_model_backup.onnx`)                                                                        |
| `local_run.py` | Convenience runner for local development                                                                                                       |
| `space/`       | Python virtual environment (optional)                                                                                                          |
| `README.md`    | This file                                                                                                                                      |

## How to reproduce / common commands

Use the project virtual environment in `space/` or create a fresh one.

1. Activate environment (PowerShell example)

```powershell
& D:\detects7\space\Scripts\Activate.ps1
pip install -r requirements.txt
cd ml
```

2. Train (example using `ml/exp12/args.yaml`)

```powershell
python train_yolo.py --data yolo_params.yaml --epochs 150 --imgsz 768 --batch 8
```

3. Evaluate (produces `evaluation_summary.json`)

```powershell
python evaluate.py
```

4. Interactive prediction (image / video)

```powershell
python predict_user.py
```

5. Backend (FastAPI) — example

```powershell
cd backend
& ..\space\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Frontend

```powershell
cd frontend
npm install
npm run dev
# then open http://localhost:5173
```

## Models & artifacts

| Artifact                   | Location                                                       |
| -------------------------- | -------------------------------------------------------------- |
| Best checkpoint            | `ml/exp12/weights/best.pt`                                     |
| Last checkpoint            | `ml/exp12/weights/last.pt`                                     |
| Exported deployment copies | `models/best_model_backup.pt`, `models/best_model_backup.onnx` |

**Tip:** keep large model files out of Git history — use Git LFS or release assets for big binaries.

## Design notes & decisions

* We initially explored RTDETR but switched to Ultralytics YOLOv8 because it gave better detection performance for this dataset.
* Training specifics (see `ml/exp12/args.yaml`): `AdamW`, `lr0=0.001`, `imgsz=768`, `batch=8`, `epochs=150`. Augmentations and other settings were tuned in the experiment.
* `evaluate.py` runs the Ultralytics evaluation suite and produces a confusion matrix and a JSON summary.

## 🗄️Dataset & acknowledgements

* Dataset: Falcon synthetic dataset — [https://falcon.duality.ai/](https://falcon.duality.ai/)
* Model backbone: Ultralytics YOLOv8

---

<p align="center"> <b>Thank you 💌</b> — Detects7 team</p>
