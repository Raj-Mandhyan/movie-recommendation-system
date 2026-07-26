from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "data" / "processed"

MODEL_DIR = PROJECT_ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

movies = pd.read_csv(
    DATA_DIR / "movies_processed.csv"
)

vectorizer = CountVectorizer(
    max_features=5000,
    stop_words="english"
)

vectors = vectorizer.fit_transform(
    movies["tags"]
).toarray()

similarity = cosine_similarity(vectors)

joblib.dump(
    vectorizer,
    MODEL_DIR / "vectorizer.joblib"
)

joblib.dump(
    similarity,
    MODEL_DIR / "similarity.joblib"
)

print("=" * 50)
print("Training completed successfully.")
print(f"Movies      : {len(movies)}")
print(f"Vocabulary  : {len(vectorizer.vocabulary_)}")
print(f"Matrix shape: {similarity.shape}")
print("=" * 50)