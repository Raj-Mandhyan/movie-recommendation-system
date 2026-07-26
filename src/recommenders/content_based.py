import pandas as pd

# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

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

        self.similarity = joblib.load(
            MODEL_DIR / "similarity.joblib"
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

        movie_index = self.movies[
            self.movies["title"] == movie_name
        ].index[0]

        distances = self.similarity[movie_index]

        movie_list = sorted(
            list(enumerate(distances)),
            reverse=True,
            key=lambda x: x[1]
        )[1:6]

        recommendations = []

        for movie in movie_list:
            recommendations.append(
                self.movies.iloc[movie[0]]["title"]
            )

        return recommendations

