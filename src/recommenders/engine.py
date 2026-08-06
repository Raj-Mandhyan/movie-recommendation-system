import pandas as pd


class RecommendationEngine:

    def __init__(
        self,
        content_model,
        embedding_model,
        collaborative_model,
        hybrid_model,
        movies_path="data/raw/movies.csv",
    ):

        self.content_model = content_model
        self.embedding_model = embedding_model
        self.collaborative_model = collaborative_model
        self.hybrid_model = hybrid_model

        self.movies = pd.read_csv(movies_path)

        self.title_to_id = dict(
            zip(
                self.movies["title"],
                self.movies["movieId"],
            )
        )

        self.id_to_title = dict(
            zip(
                self.movies["movieId"],
                self.movies["title"],
            )
        )

    def get_movie_id(self, title):
        return self.title_to_id.get(title) 

    def recommend_by_title(
        self,
        title,
        top_k=10,
    ):

        movie_id = self.get_movie_id(title)

        if movie_id is None:
            raise ValueError("Movie not found.")

        return self.hybrid_model.recommend(
            movie_id,
            top_k,
        )

    def recommend(self, movie_title: str, top_k: int = 10):
        movie_id = self.get_movie_id(movie_title)

        if movie_id is None:
            raise ValueError(f"Movie '{movie_title}' not found.")

        recommendations = self.hybrid_model.recommend(
            movie_id,
            top_k,
        )

        results = []

        for rec_movie_id, score in recommendations:
            results.append({
                "movie_id": rec_movie_id,
                "title": self.get_movie_title(rec_movie_id),
                "score": float(score),
            })

        return results