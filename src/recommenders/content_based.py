import pandas as pd

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ContentBasedRecommender:

    def __init__(self):
        self.vectorizer = CountVectorizer(
            max_features=5000,
            stop_words="english"
        )

        self.movies = None
        self.vectors = None
        self.similarity = None

    def fit(self, movies):

        self.movies = movies.copy()

        self.vectors = self.vectorizer.fit_transform(
            self.movies["tags"]
        ).toarray()

        self.similarity = cosine_similarity(self.vectors)

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

