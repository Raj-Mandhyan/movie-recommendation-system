import numpy as np

class HybridRecommender:

    def __init__(
        self,
        content_model,
        embedding_model,
        collaborative_model,
    ):
        self.content_model = content_model
        self.embedding_model = embedding_model
        self.collaborative_model = collaborative_model

    def normalize_scores(self, scores: dict):
        """
        Min-Max normalize scores to [0, 1]
        """

        if not scores:
            return {}

        values = np.array(list(scores.values()), dtype=float)

        minimum = values.min()
        maximum = values.max()

        if maximum == minimum:
            return {k: 1.0 for k in scores}

        normalized = {}

        for movie, score in scores.items():
            normalized[movie] = (score - minimum) / (maximum - minimum)

        return normalized

    def weighted_fusion(
        self,
        content_scores: dict,
        embedding_scores: dict,
        collaborative_scores: dict,
        content_weight=0.35,
        embedding_weight=0.35,
        collaborative_weight=0.30,
    ):
        """
        Combine three recommenders into one score.
        """

        content_scores = self.normalize_scores(content_scores)
        embedding_scores = self.normalize_scores(embedding_scores)
        collaborative_scores = self.normalize_scores(collaborative_scores)

        all_movies = (
            set(content_scores.keys())
            | set(embedding_scores.keys())
            | set(collaborative_scores.keys())
        )

        final_scores = {}

        for movie in all_movies:

            score = (
                content_weight * content_scores.get(movie, 0)
                + embedding_weight * embedding_scores.get(movie, 0)
                + collaborative_weight * collaborative_scores.get(movie, 0)
            )

            final_scores[movie] = score

        return final_scores

    def recommend_top_k(
        self,
        content_scores,
        embedding_scores,
        collaborative_scores,
        k=10,
    ):

        scores = self.weighted_fusion(
            content_scores,
            embedding_scores,
            collaborative_scores,
        )

        ranked = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        return ranked[:k]