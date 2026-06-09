import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def upload_file(file: UploadFile, folder: str = "lotsa") -> dict:
    ext = file.filename.split(".")[-1].lower()
    
    allowed = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS
    if ext not in allowed:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {allowed}"
        )
    
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB")
    
    file.file.seek(0)
    
    # PDFs and documents need "raw", images use "auto"
    resource_type = "raw" if ext in ALLOWED_DOCUMENT_EXTENSIONS else "auto"
    
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type=resource_type
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

def delete_file(public_id: str, resource_type: str = "raw") -> bool:
    if not public_id:
        return False
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception:
        return False