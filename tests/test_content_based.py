from pathlib import Path

import pandas as pd

from src.recommenders.content_based import ContentBasedRecommender


def main():
    data_dir = Path("data/processed")

    movies = pd.read_csv(data_dir / "movies_processed.csv")

    recommender = ContentBasedRecommender()
    recommender.fit(movies)

    recommendations = recommender.recommend("Avatar")

    print(recommendations)


if __name__ == "__main__":
    main()