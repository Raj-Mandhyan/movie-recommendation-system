from src.recommenders.engine import RecommendationEngine


class DummyHybrid:

    def recommend(self, movie_id, top_k):
        return [
            (movie_id + 1, 0.98),
            (movie_id + 2, 0.94),
            (movie_id + 3, 0.90),
        ]


engine = RecommendationEngine(
    None,
    None,
    None,
    DummyHybrid(),
)

print(
    engine.recommend_by_title(
        "Toy Story (1995)"
    )
)
