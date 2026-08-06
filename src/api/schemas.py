from pydantic import BaseModel
from typing import List, Optional

class RecommendationRequest(BaseModel):
    movie: str
    top_k: int = 10
    content_weight: float = 0.5
    collaborative_weight: float = 0.5

class MovieDetailResponse(BaseModel):
    tmdb_id: int
    title: str
    overview: str
    genres: List[str]
    release_date: str
    popularity: float
    vote_average: float
    runtime: int
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    logo_url: Optional[str] = None
    tagline: Optional[str] = None
    cast: List[dict] = []
    director: str = "Unknown"

class RecommendedMovieItem(BaseModel):
    tmdb_id: int
    title: str
    overview: str
    genres: List[str]
    release_date: str
    popularity: float
    vote_average: float
    score: float
    algorithms: List[str]
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None

class RecommendationResponse(BaseModel):
    movie: str
    recommendations: List[RecommendedMovieItem]