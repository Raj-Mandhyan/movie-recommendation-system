from fastapi import FastAPI
from fastapi import HTTPException
from src.recommenders.content_based import ContentBasedRecommender
from src.api.schemas import RecommendationResponse

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


@app.get(
    "/recommend/{movie_name}",
    response_model=RecommendationResponse
)
def recommend(movie_name: str):

    try:

        recommendations = recommender.recommend(movie_name)

        return RecommendationResponse(
            movie=movie_name,
            recommendations=recommendations
        )

    except ValueError:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )