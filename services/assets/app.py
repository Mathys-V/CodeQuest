from fastapi import FastAPI
import uvicorn

app = FastAPI(title="CodeQuest Assets Service", version="0.1.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CodeQuest Assets"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
