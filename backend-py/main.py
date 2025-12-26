from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
import uuid
import shutil
from celery_app import process_audio

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

r = Redis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

# -------------------------
# Upload audio & start Celery job
# -------------------------
@app.post("/upload")
async def upload_audio(audio: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    file_path = f"./uploads/{audio.filename}"

    # Save locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    # Save initial job state in Redis
    r.hset(f"job:{job_id}", mapping={
        "status": "pending",
        "transcript": "",
        "filename": audio.filename
    })

    # Trigger Celery worker
    process_audio.delay(job_id, audio.filename)

    return {"jobId": job_id}


# -------------------------
# Get job status
# -------------------------
@app.get("/job/{job_id}")
def get_job(job_id: str):
    data = r.hgetall(f"job:{job_id}")
    return data


# -------------------------
# Transcript history
# -------------------------
@app.get("/transcripts")
def get_transcripts():
    keys = r.keys("job:*")
    result = []

    for key in keys:
        job = r.hgetall(key)
        if job.get("status") == "completed":
            result.append({
                "id": key.split(":")[1],
                "filename": job.get("filename"),
                "text": job.get("transcript", "")
            })

    return result


# -------------------------
# Delete Transcript
# -------------------------
@app.delete("/transcripts/{job_id}")
def delete_transcript(job_id: str):
    key = f"job:{job_id}"
    if not r.exists(key):
        return {"error": "Transcript not found", "status": "failed"} // Should probably use HTTPException but keeping style simple as per codebase
    
    r.delete(key)
    return {"status": "deleted", "id": job_id}


# -------------------------
# Dummy Profile endpoint
# -------------------------
@app.get("/profile")
def get_profile():
    return {
        "name": "Demo User",
        "email": "test@example.com",
        "accessToken": "123456"
    }


# -------------------------
# Logout
# -------------------------
@app.post("/logout")
def logout():
    return {"status": "logged out"}
