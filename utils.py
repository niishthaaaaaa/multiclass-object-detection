from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from .model_loader import get_model
from .utils import read_imagefile, pil_to_bgr_np, encode_image_to_base64_bgr
from .config import CONF_THRESH
import tempfile
import uvicorn
import numpy as np
import io

app = FastAPI(title="detects7 - inference API")

# allow local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = None

@app.on_event("startup")
def startup_event():
    global MODEL
    MODEL = get_model()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...), conf: float = Query(CONF_THRESH, ge=0.0, le=1.0)):
    contents = await file.read()
    try:
        pil_img = read_imagefile(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    img_bgr = pil_to_bgr_np(pil_img)

    # Model inference (returns ultralytics Results)
    results = MODEL.predict(source=img_bgr, conf=conf, verbose=False, stream=False)
    res = results[0]  # single image

    # Annotated image (BGR)
    annotated = res.plot()  # BGR or RGB depending on version - we rely on BGR
    encoded = encode_image_to_base64_bgr(annotated)

    # Extract detections list
    names_map = getattr(res, "names", None) or getattr(MODEL, "names", {}) or {}
    if isinstance(names_map, list):
        names_map = {idx: name for idx, name in enumerate(names_map)}

    detections = []
    for box in res.boxes:
        cls = int(box.cls[0].item())
        conf_score = float(box.conf[0].item())
        x, y, w, h = box.xywhn[0].tolist()
        label = names_map.get(cls, f"Class {cls}")
        detections.append(
            {
                "class": cls,
                "class_label": label,
                "conf": conf_score,
                "xywhn": [x, y, w, h],
            }
        )

    return JSONResponse({
        "detections": detections,
        "annotated_image_b64": encoded
    })

@app.post("/predict-image/save")
async def predict_image_save(file: UploadFile = File(...), conf: float = Query(CONF_THRESH, ge=0.0, le=1.0)):
    contents = await file.read()
    pil_img = read_imagefile(contents)
    img_bgr = pil_to_bgr_np(pil_img)
    results = MODEL.predict(source=img_bgr, conf=conf, verbose=False, stream=False)
    annotated = results[0].plot()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    import cv2
    cv2.imwrite(tmp.name, annotated)
    return FileResponse(tmp.name, media_type="image/jpeg", filename="annotated.jpg")

# Video inference endpoint: accepts a video file and returns an annotated processed video
@app.post("/predict-video/save")
async def predict_video_save(file: UploadFile = File(...), conf: float = Query(CONF_THRESH, ge=0.0, le=1.0)):
    contents = await file.read()
    tmp_in = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tmp_in.write(contents)
    tmp_in.flush()
    import cv2
    cap = cv2.VideoCapture(tmp_in.name)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Unable to open uploaded video.")
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    tmp_out = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(tmp_out.name, fourcc, fps, (w,h))
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = MODEL.predict(frame, conf=conf, verbose=False, stream=False)
        annotated = results[0].plot()
        out.write(annotated)
    cap.release()
    out.release()
    return FileResponse(tmp_out.name, media_type="video/mp4", filename="annotated_video.mp4")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
