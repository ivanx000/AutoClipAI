# AutoClipAI Services
from .video_cleaner import (
    WatermarkRemovalService, 
    watermark_service,
    CaptionRemovalService,
    caption_remover_service,
    MaskBox
)

__all__ = [
    "WatermarkRemovalService", 
    "watermark_service",
    "CaptionRemovalService",
    "caption_remover_service",
    "MaskBox"
]
