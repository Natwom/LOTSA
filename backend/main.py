from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine
from .models import Base
from .routers import auth, students, announcements, events, elections, complaints, chats, notifications, admin, leaders, membership, settings, terms, documents, contributions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(elections.router, prefix="/api/elections", tags=["elections"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(leaders.router, prefix="/api/leaders", tags=["leaders"])
app.include_router(membership.router, prefix="/api/membership", tags=["membership"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(terms.router, prefix="/api/terms", tags=["terms"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(contributions.router, prefix="/api/contributions", tags=["contributions"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "LOTSA CONNECT API", "status": "running", "version": "2.0.0"}