"""
AutoClipAI Watermark Removal Service
Uses inpainting to remove watermarks from video frames.
Designed for ProPainter integration - currently uses cv2.inpaint as placeholder.
"""

import os
import cv2
import subprocess
import tempfile
import numpy as np
from pathlib import Path
from typing import Tuple, Optional, Callable, List
from dataclasses import dataclass


@dataclass
class MaskBox:
    """Represents a rectangular mask region for watermark removal."""
    x: int
    y: int
    width: int
    height: int
    
    @classmethod
    def from_string(cls, coords: str) -> "MaskBox":
        """Parse 'x,y,w,h' string into MaskBox."""
        parts = [int(p.strip()) for p in coords.split(",")]
        if len(parts) != 4:
            raise ValueError("Mask coords must be 'x,y,w,h' format")
        return cls(x=parts[0], y=parts[1], width=parts[2], height=parts[3])
    
    def to_mask(self, frame_height: int, frame_width: int) -> np.ndarray:
        """Generate binary mask array for this box."""
        mask = np.zeros((frame_height, frame_width), dtype=np.uint8)
        x1, y1 = max(0, self.x), max(0, self.y)
        x2, y2 = min(frame_width, self.x + self.width), min(frame_height, self.y + self.height)
        mask[y1:y2, x1:x2] = 255
        return mask


class WatermarkRemovalService:
    """
    Singleton service for watermark removal using video inpainting.
    
    Loads ML model once at startup. Uses ProPainter-style approach
    with cv2.inpaint as placeholder until PyTorch model is integrated.
    """
    
    _instance: Optional["WatermarkRemovalService"] = None
    _initialized: bool = False
    
    def __new__(cls) -> "WatermarkRemovalService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if WatermarkRemovalService._initialized:
            return
        
        self.model = None
        self.device = "cpu"
        self._load_model()
        WatermarkRemovalService._initialized = True
        print("✅ WatermarkRemovalService initialized")
    
    def _load_model(self):
        """
        Load the inpainting model weights.
        TODO: Replace with ProPainter model loading.
        """
        # Placeholder: ProPainter model would be loaded here
        # Example:
        # from propainter import ProPainterModel
        # self.model = ProPainterModel.load_pretrained()
        # self.model.to(self.device)
        # self.model.eval()
        
        print("👀 Model loading placeholder - using cv2.inpaint fallback")
        self.model = None  # Will use cv2.inpaint when None
    
    def _inpaint_batch(self, frames: List[np.ndarray], masks: List[np.ndarray]) -> List[np.ndarray]:
        """
        Inpaint a batch of frames to remove watermarks.
        
        TODO: Replace with ProPainter PyTorch inference.
        Currently uses cv2.inpaint (Navier-Stokes) as placeholder.
        
        Args:
            frames: List of BGR frames (H, W, 3)
            masks: List of binary masks (H, W) where 255 = inpaint region
        
        Returns:
            List of inpainted frames
        """
        if self.model is not None:
            # ProPainter inference would go here:
            # tensor_frames = self._preprocess(frames)
            # tensor_masks = self._preprocess_masks(masks)
            # with torch.no_grad():
            #     output = self.model(tensor_frames, tensor_masks)
            # return self._postprocess(output)
            pass
        
        # Fallback: OpenCV inpainting (frame-by-frame, no temporal consistency)
        inpainted = []
        for frame, mask in zip(frames, masks):
            # cv2.INPAINT_NS = Navier-Stokes based
            # cv2.INPAINT_TELEA = Fast marching method
            result = cv2.inpaint(frame, mask, inpaintRadius=5, flags=cv2.INPAINT_NS)
            inpainted.append(result)
        
        return inpainted
    
    def _extract_audio(self, input_path: Path, audio_path: Path) -> bool:
        """Extract audio track from video using FFmpeg."""
        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", str(input_path),
                "-vn",  # No video
                "-acodec", "aac",
                "-b:a", "192k",
                str(audio_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0 and audio_path.exists()
        except Exception as e:
            print(f"⚠️ Audio extraction failed: {e}")
            return False
    
    def _merge_video_audio(self, video_path: Path, audio_path: Path, 
                           output_path: Path, fps: float) -> bool:
        """Merge processed video with original audio using FFmpeg."""
        try:
            if audio_path.exists():
                cmd = [
                    "ffmpeg", "-y",
                    "-i", str(video_path),
                    "-i", str(audio_path),
                    "-c:v", "libx264",
                    "-c:a", "aac",
                    "-shortest",
                    str(output_path)
                ]
            else:
                # No audio - just copy video
                cmd = [
                    "ffmpeg", "-y",
                    "-i", str(video_path),
                    "-c:v", "libx264",
                    str(output_path)
                ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
        except Exception as e:
            print(f"⚠️ Merge failed: {e}")
            return False
    
    def process_video(
        self,
        input_path: Path,
        output_path: Path,
        mask_box: MaskBox,
        batch_size: int = 8,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> bool:
        """
        Process video to remove watermark using inpainting.
        
        This is a blocking function designed to run in a background thread.
        
        Pipeline:
            A. Extract audio from input video
            B. Process video frames with inpainting
            C. Merge processed frames with audio
        
        Args:
            input_path: Path to input video
            output_path: Path for cleaned output video
            mask_box: Region to inpaint (watermark location)
            batch_size: Number of frames to process at once
            progress_callback: Optional callback(progress: int, message: str)
        
        Returns:
            True if successful, False otherwise
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        
        def update_progress(pct: int, msg: str):
            if progress_callback:
                progress_callback(pct, msg)
            print(f"[{pct}%] {msg}")
        
        update_progress(0, "Starting watermark removal...")
        
        # Create temp directory for intermediate files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            audio_path = temp_path / "audio.aac"
            temp_video_path = temp_path / "video_no_audio.mp4"
            
            # Step A: Extract Audio
            update_progress(5, "Extracting audio...")
            has_audio = self._extract_audio(input_path, audio_path)
            
            # Step B: Process Video Frames
            update_progress(10, "Loading video...")
            
            cap = cv2.VideoCapture(str(input_path))
            if not cap.isOpened():
                raise ValueError(f"Cannot open video: {input_path}")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Generate mask for this video's dimensions
            mask = mask_box.to_mask(height, width)
            
            # Setup video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(str(temp_video_path), fourcc, fps, (width, height))
            
            update_progress(15, f"Processing {total_frames} frames...")
            
            frame_batch = []
            mask_batch = []
            frames_processed = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_batch.append(frame)
                mask_batch.append(mask)
                
                # Process batch when full
                if len(frame_batch) >= batch_size:
                    inpainted = self._inpaint_batch(frame_batch, mask_batch)
                    for f in inpainted:
                        writer.write(f)
                    frames_processed += len(frame_batch)
                    
                    # Update progress (15-85% range for processing)
                    pct = 15 + int(70 * frames_processed / total_frames)
                    update_progress(pct, f"Processed {frames_processed}/{total_frames} frames")
                    
                    frame_batch = []
                    mask_batch = []
            
            # Process remaining frames
            if frame_batch:
                inpainted = self._inpaint_batch(frame_batch, mask_batch)
                for f in inpainted:
                    writer.write(f)
            
            cap.release()
            writer.release()
            
            # Step C: Merge with Audio
            update_progress(90, "Merging audio...")
            
            success = self._merge_video_audio(
                temp_video_path, 
                audio_path if has_audio else Path(""),
                output_path,
                fps
            )
            
            if not success:
                raise RuntimeError("Failed to merge video and audio")
        
        update_progress(100, "Watermark removal complete!")
        return True


class CaptionRemovalService:
    """
    Service for removing captions/subtitles from videos.
    
    Uses text detection to find caption regions, then applies inpainting.
    Designed for bottom-screen caption removal with auto-detection.
    """
    
    _instance: Optional["CaptionRemovalService"] = None
    _initialized: bool = False
    
    def __new__(cls) -> "CaptionRemovalService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if CaptionRemovalService._initialized:
            return
        
        self.watermark_service = WatermarkRemovalService()
        CaptionRemovalService._initialized = True
        print("✅ CaptionRemovalService initialized")
    
    def _detect_caption_region(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect caption/text regions in the bottom portion of a frame.
        
        Uses edge detection and contour analysis to find text areas.
        Returns a binary mask of detected caption regions.
        """
        height, width = frame.shape[:2]
        
        # Focus on bottom 25% of frame where captions typically appear
        bottom_region_start = int(height * 0.75)
        bottom_region = frame[bottom_region_start:, :]
        
        # Convert to grayscale
        gray = cv2.cvtColor(bottom_region, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to find high-contrast text
        # Captions are usually white or bright text
        _, thresh_white = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        
        # Also check for dark text on light backgrounds
        _, thresh_dark = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
        
        # Combine both thresholds
        combined = cv2.bitwise_or(thresh_white, thresh_dark)
        
        # Dilate to connect nearby text characters
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 5))
        dilated = cv2.dilate(combined, kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Create mask for the full frame
        mask = np.zeros((height, width), dtype=np.uint8)
        
        # Filter contours that look like text regions
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Text regions are typically wide and short
            aspect_ratio = w / max(h, 1)
            area = w * h
            
            # Filter: aspect ratio > 3 (wide text), reasonable size
            if aspect_ratio > 2 and area > 500 and w > 50:
                # Add padding around the detected region
                pad_x, pad_y = 10, 5
                x1 = max(0, x - pad_x)
                y1 = max(0, bottom_region_start + y - pad_y)
                x2 = min(width, x + w + pad_x)
                y2 = min(height, bottom_region_start + y + h + pad_y)
                
                mask[y1:y2, x1:x2] = 255
        
        # If no text detected, return None
        if np.sum(mask) == 0:
            return None
        
        return mask
    
    def _detect_caption_mask_simple(self, height: int, width: int, 
                                     caption_height_percent: float = 0.15) -> np.ndarray:
        """
        Generate a simple mask covering the bottom caption region.
        
        Fallback when auto-detection isn't used or fails.
        """
        mask = np.zeros((height, width), dtype=np.uint8)
        caption_start = int(height * (1 - caption_height_percent))
        mask[caption_start:, :] = 255
        return mask
    
    def process_video(
        self,
        input_path: Path,
        output_path: Path,
        auto_detect: bool = True,
        caption_region_percent: float = 0.15,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> bool:
        """
        Process video to remove captions using inpainting.
        
        Args:
            input_path: Path to input video
            output_path: Path for output video
            auto_detect: Whether to auto-detect caption regions per frame
            caption_region_percent: Fallback region size (bottom % of frame)
            progress_callback: Optional callback(progress: int, message: str)
        
        Returns:
            True if successful
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        
        def update_progress(pct: int, msg: str):
            if progress_callback:
                progress_callback(pct, msg)
            print(f"[{pct}%] {msg}")
        
        update_progress(0, "Starting caption removal...")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            audio_path = temp_path / "audio.aac"
            temp_video_path = temp_path / "video_no_audio.mp4"
            
            # Extract audio
            update_progress(5, "Extracting audio...")
            has_audio = self.watermark_service._extract_audio(input_path, audio_path)
            
            # Open video
            update_progress(10, "Loading video...")
            cap = cv2.VideoCapture(str(input_path))
            if not cap.isOpened():
                raise ValueError(f"Cannot open video: {input_path}")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Setup writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(str(temp_video_path), fourcc, fps, (width, height))
            
            update_progress(15, f"Processing {total_frames} frames...")
            
            # Pre-compute static mask if not auto-detecting
            static_mask = None
            if not auto_detect:
                static_mask = self._detect_caption_mask_simple(height, width, caption_region_percent)
            
            frames_processed = 0
            batch_size = 8
            frame_batch = []
            mask_batch = []
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Get mask for this frame
                if auto_detect:
                    detected_mask = self._detect_caption_region(frame)
                    if detected_mask is not None:
                        mask = detected_mask
                    else:
                        # No captions detected, use frame as-is
                        mask = np.zeros((height, width), dtype=np.uint8)
                else:
                    mask = static_mask
                
                frame_batch.append(frame)
                mask_batch.append(mask)
                
                if len(frame_batch) >= batch_size:
                    # Only inpaint frames that have masks
                    inpainted = self.watermark_service._inpaint_batch(frame_batch, mask_batch)
                    for f in inpainted:
                        writer.write(f)
                    frames_processed += len(frame_batch)
                    
                    pct = 15 + int(70 * frames_processed / total_frames)
                    update_progress(pct, f"Processed {frames_processed}/{total_frames} frames")
                    
                    frame_batch = []
                    mask_batch = []
            
            # Process remaining frames
            if frame_batch:
                inpainted = self.watermark_service._inpaint_batch(frame_batch, mask_batch)
                for f in inpainted:
                    writer.write(f)
            
            cap.release()
            writer.release()
            
            # Merge with audio
            update_progress(90, "Merging audio...")
            success = self.watermark_service._merge_video_audio(
                temp_video_path,
                audio_path if has_audio else Path(""),
                output_path,
                fps
            )
            
            if not success:
                raise RuntimeError("Failed to merge video and audio")
        
        update_progress(100, "Caption removal complete!")
        return True


# Singleton instances for import
watermark_service = WatermarkRemovalService()
caption_remover_service = CaptionRemovalService()
