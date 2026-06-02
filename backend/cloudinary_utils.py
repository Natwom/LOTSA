import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def upload_file(file: UploadFile, folder: str = "lotsa") -> dict:
    """
    Upload a file to Cloudinary.
    Returns: {"url": "https://...", "public_id": "lotsa/abc123"}
    """
    # Validate extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Validate size (read first chunk to check)
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB")
    
    # Reset file pointer for upload
    file.file.seek(0)
    
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="auto"  # handles images, PDFs, etc.
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

def delete_file(public_id: str) -> bool:
    """Delete a file from Cloudinary by public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False