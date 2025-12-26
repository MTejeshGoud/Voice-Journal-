from celery import Celery
from groq_client import call_groq_transcription
from redis import Redis

celery_app = Celery(
    "worker",
    broker="redis://127.0.0.1:6379/0",
    backend="redis://127.0.0.1:6379/0"
)

@celery_app.task
def process_audio(jobId, fileName):
    print(f"Processing job {jobId} for file {fileName}...")

    file_path = f"./uploads/{fileName}"  # adjust storage path

    try:
        transcript = call_groq_transcription(jobId, file_path)

        r = Redis(host="127.0.0.1", port=6379, db=0)
        r.hset(f"job:{jobId}", mapping={
            "status": "completed",
            "transcript": transcript
        })

        return {"job_id": jobId, "status": "completed", "transcript": transcript}
    except Exception as e:
        print("Error processing audio:", e)
        r = Redis(host="127.0.0.1", port=6379, db=0)
        r.hset(f"job:{jobId}", mapping={
            "status": "failed",
            "error": str(e)
        })
        return {"job_id": jobId, "status": "failed", "error": str(e)}