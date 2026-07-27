from pathlib import Path

import faiss
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

DATA_DIR = Path("data/processed")
MODEL_DIR = Path("models")

MODEL_DIR.mkdir(exist_ok=True)

movies = pd.read_csv(DATA_DIR / "movies_processed.csv")

vectorizer = CountVectorizer(
    max_features=5000,
    stop_words="english",
)

vectors = vectorizer.fit_transform(
    movies["tags"]
).toarray()

# FAISS expects float32
vectors = vectors.astype(np.float32)

# Normalize vectors so inner product = cosine similarity
faiss.normalize_L2(vectors)

dimension = vectors.shape[1]

index = faiss.IndexFlatIP(dimension)

index.add(vectors)

joblib.dump(
    vectorizer,
    MODEL_DIR / "vectorizer.joblib",
)

faiss.write_index(
    index,
    str(MODEL_DIR / "faiss.index"),
)

print("=" * 50)
print("FAISS training completed.")
print(f"Movies     : {len(movies)}")
print(f"Dimension  : {dimension}")
print(f"Index size : {index.ntotal}")
print("=" * 50)