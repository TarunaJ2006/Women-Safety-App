"""
Model downloader utility for automatic ONNX model acquisition.
Downloads and exports AI models on first startup if they don't exist.
"""
import os
import logging
import shutil
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

def ensure_vision_models(artifacts_dir: str = "app/artifacts/vision") -> bool:
    """
    Ensure YOLOv8 ONNX models exist. Downloads and exports if missing.
    
    Args:
        artifacts_dir: Directory to store ONNX models
        
    Returns:
        True if models are ready, False otherwise
    """
    try:
        Path(artifacts_dir).mkdir(parents=True, exist_ok=True)
        
        model_people = os.path.join(artifacts_dir, "yolov8n.onnx")
        model_pose = os.path.join(artifacts_dir, "yolov8n-pose.onnx")
        
        # Check if both models exist
        if os.path.exists(model_people) and os.path.exists(model_pose):
            logger.info(f"✅ Vision models already exist in {artifacts_dir}")
            return True
        
        logger.info("📥 Downloading and exporting YOLOv8 models to ONNX...")
        
        from ultralytics import YOLO
        
        # Download and export yolov8n (person detection)
        if not os.path.exists(model_people):
            logger.info("⬇️  Downloading yolov8n.pt and exporting to ONNX...")
            yolo_detect = YOLO('yolov8n.pt')
            export_path = yolo_detect.export(format='onnx', simplify=True)
            
            # Move to artifacts directory
            if os.path.exists(export_path):
                shutil.move(export_path, model_people)
                logger.info(f"✅ yolov8n.onnx saved to {model_people}")
            else:
                logger.error(f"❌ Export failed for yolov8n")
                return False
        
        # Download and export yolov8n-pose (pose estimation)
        if not os.path.exists(model_pose):
            logger.info("⬇️  Downloading yolov8n-pose.pt and exporting to ONNX...")
            yolo_pose = YOLO('yolov8n-pose.pt')
            export_path = yolo_pose.export(format='onnx', simplify=True)
            
            # Move to artifacts directory
            if os.path.exists(export_path):
                shutil.move(export_path, model_pose)
                logger.info(f"✅ yolov8n-pose.onnx saved to {model_pose}")
            else:
                logger.error(f"❌ Export failed for yolov8n-pose")
                return False
        
        logger.info("🎉 All vision models ready!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to prepare vision models: {e}")
        return False


def ensure_audio_model(artifacts_dir: str = "app/artifacts/audio") -> bool:
    """
    Ensure SER ONNX model exists. Downloads from Hugging Face if missing.
    
    Args:
        artifacts_dir: Directory to store ONNX model and config
        
    Returns:
        True if model is ready, False otherwise
    """
    try:
        Path(artifacts_dir).mkdir(parents=True, exist_ok=True)
        
        model_path = os.path.join(artifacts_dir, "model.onnx")
        config_path = os.path.join(artifacts_dir, "config.json")
        preprocessor_path = os.path.join(artifacts_dir, "preprocessor_config.json")
        
        # Check if all required files exist
        if os.path.exists(model_path) and os.path.exists(config_path) and os.path.exists(preprocessor_path):
            logger.info(f"✅ Audio model already exists in {artifacts_dir}")
            return True
        
        logger.info("📥 Downloading Speech Emotion Recognition model from Hugging Face...")
        
        from huggingface_hub import hf_hub_download
        
        repo_id = "onnx-community/Speech-Emotion-Classification-ONNX"
        
        # Download model.onnx
        if not os.path.exists(model_path):
            logger.info(f"⬇️  Downloading model.onnx from {repo_id}...")
            downloaded_model = hf_hub_download(
                repo_id=repo_id,
                filename="onnx/model.onnx",
                cache_dir=None
            )
            shutil.copy(downloaded_model, model_path)
            logger.info(f"✅ model.onnx saved to {model_path}")
        
        # Download config.json
        if not os.path.exists(config_path):
            logger.info(f"⬇️  Downloading config.json...")
            downloaded_config = hf_hub_download(
                repo_id=repo_id,
                filename="config.json",
                cache_dir=None
            )
            shutil.copy(downloaded_config, config_path)
            logger.info(f"✅ config.json saved to {config_path}")
        
        # Download preprocessor_config.json
        if not os.path.exists(preprocessor_path):
            logger.info(f"⬇️  Downloading preprocessor_config.json...")
            downloaded_preprocessor = hf_hub_download(
                repo_id=repo_id,
                filename="preprocessor_config.json",
                cache_dir=None
            )
            shutil.copy(downloaded_preprocessor, preprocessor_path)
            logger.info(f"✅ preprocessor_config.json saved to {preprocessor_path}")
        
        logger.info("🎉 Audio model ready!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to prepare audio model: {e}")
        return False
