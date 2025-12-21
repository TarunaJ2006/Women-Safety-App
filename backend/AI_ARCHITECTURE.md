# AI Architecture - Passive Mode

The backend operates in **Passive Mode**, meaning it does not attempt to access local system hardware (Camera/Mic). Instead, it provides endpoints for the frontend to "push" data for analysis.

## 1. Modalities

### Vision (YOLOv8)
- **Engine:** `app/ai/vision/engine.py`
- **Models:** 
  - `app/artifacts/vision/yolov8n.onnx` (Person Detection)
  - `app/artifacts/vision/yolov8n-pose.onnx` (Pose Estimation)
- **Process:** Base64/Byte stream frames are decoded and passed through ONNX inference.

### Audio (SER)
- **Engine:** `app/ai/audio/engine.py`
- **Model:** `app/artifacts/audio/model.onnx` (Speech Emotion Recognition)
- **Process:** WebM/Opus audio chunks are decoded via `librosa` (using `ffmpeg` backend), resampled to 16kHz Mono, and analyzed.

## 2. Decision Engine
- **Logic:** `app/services/decision.py`
- **Fusion:** Uses a weighted formula (50% Vision + 40% Audio + 10% Context) to compute a composite Threat Score (0-100).

## 3. Maintenance
- To update models, use the provided notebooks in the `notebooks/` directory.
- The engines expect artifacts in the modality-specific subfolders of `app/artifacts/`.
