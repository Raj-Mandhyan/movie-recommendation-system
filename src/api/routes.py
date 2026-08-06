from fastapi import APIRouter, HTTPException, Query
from src.api.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    MovieDetailResponse,
    RecommendedMovieItem,
)
from src.services.recommender import recommender_service
from src.services.tmdb import tmdb_service

router = APIRouter(prefix="/api")

@router.get("/")
def home():
    return {
        "message": "Movie Recommendation API Running",
        "status": "online"
    }

@router.get("/movies/search")
def search_movies(query: str = Query(..., description="Query string for movie search")):
    try:
        results = recommender_service.search_movies(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/movies/trending")
def get_trending(limit: int = Query(15, description="Number of trending movies to return")):
    try:
        trending = recommender_service.get_trending_movies(limit)
        enriched = []
        for item in trending:
            tmdb_id = item["tmdb_id"]
            tmdb_details = tmdb_service.get_movie_details(tmdb_id)
            
            poster_url = tmdb_details.get("poster_url")
            overview = item["overview"]
            if poster_url:
                overview += f"\n\n[Poster Image]({poster_url})"
                
            enriched.append({
                **item,
                "overview": overview,
                "poster_url": poster_url,
                "backdrop_url": tmdb_details.get("backdrop_url"),
                "logo_url": tmdb_details.get("logo_url"),
                "tagline": tmdb_details.get("tagline"),
                "cast": tmdb_details.get("cast", []),
                "director": tmdb_details.get("director", "Unknown")
            })
        return enriched
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/movies/{tmdb_id}", response_model=MovieDetailResponse)
def get_movie(tmdb_id: int):
    # Fetch database info
    info = recommender_service.get_movie_by_tmdb_id(tmdb_id)
    if not info:
        raise HTTPException(status_code=404, detail="Movie not found in database.")
    
    # Fetch TMDB poster and credit details
    tmdb_details = tmdb_service.get_movie_details(tmdb_id)
    
    # Append poster URL to description/overview
    poster_url = tmdb_details.get("poster_url")
    overview = info.get("overview") or tmdb_details.get("overview") or ""
    if poster_url:
        overview += f"\n\n[Poster Image]({poster_url})"
    
    # Combine results
    response_data = {
        **info,
        "overview": overview,
        "poster_url": poster_url,
        "backdrop_url": tmdb_details.get("backdrop_url"),
        "logo_url": tmdb_details.get("logo_url"),
        "tagline": tmdb_details.get("tagline"),
        "cast": tmdb_details.get("cast", []),
        "director": tmdb_details.get("director", "Unknown")
    }
    
    return response_data

@router.post("/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):
    try:
        # Get recommended lists
        recs = recommender_service.recommend(
            title=request.movie,
            top_k=request.top_k,
            content_weight=request.content_weight,
            collaborative_weight=request.collaborative_weight
        )
        
        # Populate TMDB poster/backdrop urls for each recommended item
        enriched_recs = []
        for item in recs:
            tmdb_id = item["tmdb_id"]
            tmdb_details = tmdb_service.get_movie_details(tmdb_id)
            
            poster_url = tmdb_details.get("poster_url")
            overview = item["overview"]
            if poster_url:
                overview += f"\n\n[Poster Image]({poster_url})"
                
            enriched_recs.append(
                RecommendedMovieItem(
                    tmdb_id=tmdb_id,
                    title=item["title"],
                    overview=overview,
                    genres=item["genres"],
                    release_date=item["release_date"],
                    popularity=item["popularity"],
                    vote_average=item["vote_average"],
                    score=item["score"],
                    algorithms=item["algorithms"],
                    poster_url=poster_url,
                    backdrop_url=tmdb_details.get("backdrop_url")
                )
            )

        return RecommendationResponse(
            movie=request.movie,
            recommendations=enriched_recs
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/about")
def get_about_metadata():
    return {
        "dataset": {
            "name": "TMDB 5000 & MovieLens Hybrid Dataset",
            "total_processed_movies": len(recommender_service.movies_processed),
            "total_ratings": len(recommender_service.ratings),
            "unique_users": len(recommender_service.ratings["userId"].unique())
        },
        "algorithms": [
            {
                "name": "Content-Based Filtering",
                "features": "Genres, Keywords, Cast, Crew, Overview tags",
                "model": "TF-IDF/CountVectorizer & FAISS L2 Search",
                "details": "Converts text tags to vectors and queries FAISS index for high-speed similarity search."
            },
            {
                "name": "Collaborative Filtering",
                "features": "User interaction ratings Matrix",
                "model": "PyTorch Matrix Factorization Model",
                "details": "Learns 64-dimensional user and item latent embedding weights. similarity computed in latent space."
            },
            {
                "name": "Hybrid Fusion Recommender",
                "features": "Fused normalized weights",
                "model": "Weighted Linear Fusion",
                "details": "Applies min-max score normalisation and combines both algorithm outputs via adjustable weights."
            }
        ]
    }