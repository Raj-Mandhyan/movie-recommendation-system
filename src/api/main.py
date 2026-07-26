from fastapi import FastAPI

from src.recommenders.content_based import ContentBasedRecommender

app = FastAPI(
    title="Movie Recommendation API",
    version="1.0.0"
)

recommender = ContentBasedRecommender()


@app.get("/")
def root():
    return {
        "message": "Movie Recommendation API"
    }


@app.get("/recommend/{movie_name}")
def recommend(movie_name: str):

    recommendations = recommender.recommend(movie_name)

    return {
        "movie": movie_name,
        "recommendations": recommendations
    }