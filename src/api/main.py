from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router

app = FastAPI(
    title="CineMind AI Recommendation Engine",
    description="Production-Grade FastAPI Recommendation Engine Wrapper",
    version="1.0.0"
)

# Enable CORS for the React/Vite development server and production sites
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the unified API routes
app.include_router(router)

@app.get("/")
def read_root():
    return {
        "engine": "CineMind AI",
        "status": "active",
        "endpoints": {
            "search": "/api/movies/search?query=...",
            "details": "/api/movies/{id}",
            "recommend": "/api/recommend",
            "about": "/api/about"
        }
    }