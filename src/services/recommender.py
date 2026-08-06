import os
import pandas as pd
import numpy as np
import torch
from pathlib import Path
from src.recommenders.content_based import ContentBasedRecommender
from src.collaborative.model import MatrixFactorization
from src.hybrid.hybrid import HybridRecommender

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_RAW = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
MODEL_DIR = PROJECT_ROOT / "models"

class RecommenderService:
    def __init__(self):
        # 1. Load CSV data
        self.movies_processed = pd.read_csv(DATA_PROCESSED / "movies_processed.csv")
        self.movies_raw = pd.read_csv(DATA_RAW / "movies.csv")
        self.tmdb_movies = pd.read_csv(DATA_RAW / "tmdb_5000_movies.csv")
        self.links = pd.read_csv(DATA_RAW / "links.csv")
        self.ratings = pd.read_csv(DATA_RAW / "ratings.csv")

        # 2. Build ID mapping dictionaries
        # links.csv columns: movieId, imdbId, tmdbId
        self.tmdb_to_movielens = {}
        self.movielens_to_tmdb = {}
        for _, row in self.links.dropna(subset=["tmdbId", "movieId"]).iterrows():
            tmdb_id = int(row["tmdbId"])
            movielens_id = int(row["movieId"])
            self.tmdb_to_movielens[tmdb_id] = movielens_id
            self.movielens_to_tmdb[movielens_id] = tmdb_id

        # 3. Create movie mapping to index as done in MovieLensDataset
        unique_movies = self.ratings["movieId"].unique()
        self.movie_to_idx = {movie: idx for idx, movie in enumerate(unique_movies)}
        self.idx_to_movie = {idx: movie for idx, movie in enumerate(unique_movies)}
        
        # 4. Instantiate PyTorch Matrix Factorization Model (black-box)
        # n_users = len(self.ratings["userId"].unique())
        # n_movies = len(unique_movies)
        # self.collab_model = MatrixFactorization(
        #     n_users=n_users,
        #     n_movies=n_movies,
        #     embedding_dim=64
        # )

        # del self.ratings

        # import gc
        # gc.collect()
        
        # collab_pth = MODEL_DIR / "collaborative_model" / "matrix_factorization.pth"
        # if collab_pth.exists():
        #     self.collab_model.load_state_dict(
        #         torch.load(collab_pth, map_location="cpu")
        #     )
        # self.collab_model.eval()

        self.n_users = len(self.ratings["userId"].unique())
        self.n_movies = len(unique_movies)

        self.collab_model = None

        self.collab_pth = MODEL_DIR / "collaborative_model" / "matrix_factorization.pth"

        # 5. Instantiate Black-box Content-Based Recommender
        self.content_recommender = None

        # 6. Instantiate Hybrid Recommender
        self.hybrid_recommender = HybridRecommender(
            content_model=None,
            embedding_model=None,
            collaborative_model=None
        )

    def get_movie_by_tmdb_id(self, tmdb_id: int) -> dict:
        """
        Get metadata of a movie from our database by TMDB ID.
        """
        row = self.movies_processed[self.movies_processed["movie_id"] == tmdb_id]
        if row.empty:
            return None
        
        title = row.iloc[0]["title"]
        
        # Find raw details if possible (release year, popularity, vote average)
        # We also read tmdb_5000_movies.csv for richer metadata
        tmdb_raw_path = DATA_RAW / "tmdb_5000_movies.csv"
        overview = ""
        genres = []
        release_date = ""
        popularity = 0.0
        vote_average = 0.0
        runtime = 0
        
        if tmdb_raw_path.exists():
            try:
                tmdb_movies = self.tmdb_movies
                match = tmdb_movies[tmdb_movies["id"] == tmdb_id]
                if not match.empty:
                    overview = str(match.iloc[0]["overview"])
                    release_date = str(match.iloc[0]["release_date"])
                    popularity = float(match.iloc[0]["popularity"])
                    vote_average = float(match.iloc[0]["vote_average"])
                    runtime = int(match.iloc[0]["runtime"]) if not pd.isna(match.iloc[0]["runtime"]) else 0
                    
                    import json
                    try:
                        genres_data = json.loads(match.iloc[0]["genres"])
                        genres = [g["name"] for g in genres_data]
                    except Exception:
                        genres = []
            except Exception:
                pass

        return {
            "tmdb_id": tmdb_id,
            "title": title,
            "overview": overview,
            "genres": genres,
            "release_date": release_date,
            "popularity": popularity,
            "vote_average": vote_average,
            "runtime": runtime
        }

    def search_movies(self, query: str, limit: int = 10) -> list:
        """
        Autocompletion search inside local dataset.
        """
        if not query:
            return []
        
        # Match case-insensitive substrings in titles
        matches = self.movies_processed[
            self.movies_processed["title"].str.contains(query, case=False, na=False)
        ]
        
        results = []
        for _, row in matches.head(limit).iterrows():
            results.append({
                "tmdb_id": int(row["movie_id"]),
                "title": row["title"]
            })
        return results

    def get_collaborative_scores(self, movie_lens_id: int) -> dict:
        """
        Compute cosine similarity scores in the collaborative embedding space
        between the query movie and all other movies in ratings.csv.
        """

        if self.collab_model is None:

            self.collab_model = MatrixFactorization(
                n_users=self.n_users,
                n_movies=self.n_movies,
                embedding_dim=64
            )

            if self.collab_pth.exists():
                self.collab_model.load_state_dict(
                    torch.load(self.collab_pth, map_location="cpu")
                )

            self.collab_model.eval()

            self.hybrid_recommender.collaborative_model = self.collab_model


        idx = self.movie_to_idx.get(movie_lens_id)
        if idx is None:
            return {}

        with torch.no_grad():
            weights = self.collab_model.movie_embedding.weight
            # Cosine similarity calculation
            weights_norm = weights / (weights.norm(dim=1, keepdim=True) + 1e-8)
            movie_embed = weights[idx].unsqueeze(0)
            movie_embed_norm = movie_embed / (movie_embed.norm(dim=1, keepdim=True) + 1e-8)
            
            similarities = torch.mm(movie_embed_norm, weights_norm.t()).squeeze(0).cpu().numpy()
        
        scores = {}
        for i, sim in enumerate(similarities):
            movie_id = self.idx_to_movie[i]
            scores[movie_id] = float(sim)
        
        return scores

    def recommend(self, title: str, top_k: int = 10, content_weight=0.5, collaborative_weight=0.5) -> list:
        """
        Generate recommendations using Content-Based, Collaborative, or Hybrid Weighted Fusion.
        """
        # Find query movie in processed dataset (TMDB titles)
        best_match = None
        from rapidfuzz import process
        match_res = process.extractOne(title, self.movies_processed["title"])
        if match_res:
            matched_title, score, movie_index = match_res
            if score >= 60:
                best_match = self.movies_processed.iloc[movie_index]

        if best_match is None:
            raise ValueError(f"Movie '{title}' not found in database.")

        q_tmdb_id = int(best_match["movie_id"])
        q_title = best_match["title"]
        q_movie_lens_id = self.tmdb_to_movielens.get(q_tmdb_id)

        # 1. Gather Content-Based scores
        # The content_recommender outputs recommended titles (black-box API)
        try:
            if self.content_recommender is None:
                self.content_recommender = ContentBasedRecommender()   

            self.hybrid_recommender.content_model = self.content_recommender
            content_titles = self.content_recommender.recommend(q_title)
        except Exception:
            content_titles = []

        # Convert content titles to MovieLens IDs with ranked scores
        content_scores = {}
        for rank, c_title in enumerate(content_titles):
            # Map title to tmdb ID
            match_row = self.movies_processed[self.movies_processed["title"] == c_title]
            if not match_row.empty:
                c_tmdb_id = int(match_row.iloc[0]["movie_id"])
                c_ml_id = self.tmdb_to_movielens.get(c_tmdb_id)
                if c_ml_id:
                    # Higher score for higher rank
                    content_scores[c_ml_id] = 1.0 - (rank * 0.15)

        # 2. Gather Collaborative Filtering scores
        collab_scores = {}
        if q_movie_lens_id is not None:
            collab_scores = self.get_collaborative_scores(q_movie_lens_id)

        # 3. Fuse scores using HybridRecommender logic
        # We set embedding_weight to 0 because embedding index is empty.
        fused_results = self.hybrid_recommender.recommend_top_k(
            content_scores=content_scores,
            embedding_scores={},
            collaborative_scores=collab_scores,
            k=top_k + 1 # Get one extra in case it contains the query movie itself
        )

        results = []
        for ml_id, score in fused_results:
            # Exclude the query movie itself
            if ml_id == q_movie_lens_id:
                continue
            
            tmdb_id = self.movielens_to_tmdb.get(ml_id)
            if not tmdb_id:
                continue
            
            # Fetch details from our localized dataset
            details = self.get_movie_by_tmdb_id(tmdb_id)
            if not details:
                continue
            
            # Identify which algorithm contributed
            algorithms = []
            if ml_id in content_scores:
                algorithms.append("Content-Based (Tags)")
            if ml_id in collab_scores and collab_scores[ml_id] > 0.4:
                algorithms.append("Collaborative (User Ratings)")
                
            results.append({
                "tmdb_id": tmdb_id,
                "title": details["title"],
                "overview": details["overview"],
                "genres": details["genres"],
                "release_date": details["release_date"],
                "popularity": details["popularity"],
                "vote_average": details["vote_average"],
                "score": float(score),
                "algorithms": algorithms if algorithms else ["Hybrid Fusion"]
            })

        return results[:top_k]

    def get_trending_movies(self, limit: int = 15) -> list:
        """
        Get the most popular movies from our dataset by popularity.
        """
        tmdb_raw_path = DATA_RAW / "tmdb_5000_movies.csv"
        if not tmdb_raw_path.exists():
            return []
        
        try:
            tmdb_movies = pd.read_csv(tmdb_raw_path)
            # Sort by popularity descending
            popular = tmdb_movies.sort_values(by="popularity", ascending=False).head(limit)
            
            results = []
            for _, row in popular.iterrows():
                tmdb_id = int(row["id"])
                
                # Fetch genres
                genres = []
                try:
                    import json
                    genres_data = json.loads(row["genres"])
                    genres = [g["name"] for g in genres_data]
                except Exception:
                    pass
                
                results.append({
                    "tmdb_id": tmdb_id,
                    "title": str(row["title"]),
                    "overview": str(row["overview"]) if not pd.isna(row["overview"]) else "",
                    "genres": genres,
                    "release_date": str(row["release_date"]) if not pd.isna(row["release_date"]) else "",
                    "popularity": float(row["popularity"]) if not pd.isna(row["popularity"]) else 0.0,
                    "vote_average": float(row["vote_average"]) if not pd.isna(row["vote_average"]) else 0.0,
                    "runtime": int(row["runtime"]) if not pd.isna(row["runtime"]) else 0
                })
            return results
        except Exception as e:
            print(f"Error loading trending movies: {e}")
            return []

recommender_service = RecommenderService()
