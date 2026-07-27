from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    movie: str
    recommendations: list[str]