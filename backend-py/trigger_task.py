import sys
from celery_app import process_audio

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python trigger_task.py <jobId> <fileName>")
        sys.exit(1)

    job_id = sys.argv[1]
    file_name = sys.argv[2]

    print(f"Triggering task for Job: {job_id}, File: {file_name}")
    
    # Trigger the task asynchronously
    process_audio.delay(job_id, file_name)
    
    print("Task triggered successfully.")
