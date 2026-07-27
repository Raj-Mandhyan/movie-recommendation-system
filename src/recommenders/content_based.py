import pandas as pd
import faiss
import numpy as np

# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import process
from pathlib import Path
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "models"

DATA_DIR = PROJECT_ROOT / "data" / "processed"
class ContentBasedRecommender:

    def __init__(self):

        self.vectorizer = joblib.load(
            MODEL_DIR / "vectorizer.joblib"
        )

        # self.similarity = joblib.load(
        #     MODEL_DIR / "similarity.joblib"
        # )
        self.index = faiss.read_index(
            str(MODEL_DIR / "faiss.index")
        )

        self.movies = pd.read_csv(
            DATA_DIR / "movies_processed.csv"
        )

    # def fit(self, movies):

    #     self.movies = movies.copy()

    #     self.vectors = self.vectorizer.fit_transform(
    #         self.movies["tags"]
    #     ).toarray()

    #     self.similarity = cosine_similarity(self.vectors)

    def recommend(self, movie_name):

        # movie = self.movies[
        #     self.movies["title"].str.lower() == movie_name.lower()
        # ]

        # if movie.empty:
        #     raise ValueError("Movie not found")

        # movie_index = movie.index[0]
        
        best_match = process.extractOne(
            movie_name,
            self.movies["title"]
        )

        if best_match is None:
            raise ValueError("Movie not found")

        matched_title, score, movie_index = best_match

        if score < 60:
            raise ValueError("Movie not found")
        
        # distances = self.similarity[movie_index]

        # movie_list = sorted(
        #     list(enumerate(distances)),
        #     reverse=True,
        #     key=lambda x: x[1]
        # )[1:6]

        # recommendations = []

        # for movie in movie_list:
        #     recommendations.append(
        #         self.movies.iloc[movie[0]]["title"]
        #     )

        # return recommendations

        query = self.vectorizer.transform(
            [self.movies.iloc[movie_index]["tags"]]
        ).toarray().astype(np.float32)

        faiss.normalize_L2(query)

        scores, indices = self.index.search(
            query,
            6
        )

        recommendations = []

        for idx in indices[0][1:]:
            recommendations.append(
                self.movies.iloc[idx]["title"]
            )

        return recommendations
