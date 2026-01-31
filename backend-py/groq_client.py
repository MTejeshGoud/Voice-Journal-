import os
from dotenv import load_dotenv
import requests

load_dotenv(encoding="utf-8")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

def call_groq_transcription(jobId, file_path):
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
    files = {"file": open(file_path, "rb")}
    data = {"model": "whisper-large-v3"}

    response = requests.post(GROQ_API_URL, headers=headers, files=files, data=data)
    response.raise_for_status()
    result = response.json()

    return result.get("text", "")