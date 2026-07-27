from typing import Iterable
import math
import numpy as np

def precision_at_k(
    recommended: Iterable,
    relevant: Iterable,
    k: int,
):
    recommended = list(recommended)[:k]
    relevant = set(relevant)

    if k == 0:
        return 0.0

    hits = len(set(recommended) & relevant)

    return hits / k


def recall_at_k(
    recommended: Iterable,
    relevant: Iterable,
    k: int,
):
    recommended = list(recommended)[:k]
    relevant = set(relevant)

    if len(relevant) == 0:
        return 0.0

    hits = len(set(recommended) & relevant)

    return hits / len(relevant)

def ndcg_at_k(
    recommended,
    relevant,
    k,
):
    recommended = list(recommended)[:k]
    relevant = set(relevant)

    dcg = 0.0

    for i, movie in enumerate(recommended):
        if movie in relevant:
            dcg += 1 / math.log2(i + 2)

    ideal_hits = min(len(relevant), k)

    if ideal_hits == 0:
        return 0.0

    idcg = sum(
        1 / math.log2(i + 2)
        for i in range(ideal_hits)
    )

    return dcg / idcg

def average_precision_at_k(
    recommended,
    relevant,
    k,
):
    recommended = list(recommended)[:k]
    relevant = set(relevant)

    if len(relevant) == 0:
        return 0.0

    score = 0.0
    hits = 0

    for i, movie in enumerate(recommended):
        if movie in relevant:
            hits += 1
            score += hits / (i + 1)

    return score / min(len(relevant), k)

def coverage(
    recommended_items,
    all_items,
):
    """
    recommended_items:
        iterable containing every unique movie
        recommended by the system

    all_items:
        iterable containing every movie
        in the dataset
    """

    recommended_items = set(recommended_items)
    all_items = set(all_items)

    return len(recommended_items) / len(all_items)

def diversity(
    embeddings,
):
    """
    embeddings:
        numpy array of shape
        (num_recommended, embedding_dim)

    Returns average pairwise cosine distance.
    """

    if len(embeddings) < 2:
        return 0.0

    embeddings = embeddings / (
        np.linalg.norm(
            embeddings,
            axis=1,
            keepdims=True,
        ) + 1e-10
    )

    similarity = embeddings @ embeddings.T

    distance = 1 - similarity

    upper = np.triu_indices(
        len(embeddings),
        k=1,
    )

    return distance[upper].mean()

def novelty(
    recommended_items,
    popularity,
):
    """
    recommended_items:
        list of recommended movie IDs

    popularity:
        dict
        {
            movie_id : probability_of_being_interacted_with
        }
    """

    score = 0.0

    for movie in recommended_items:
        p = popularity.get(movie, 1e-10)
        score += -math.log2(p)

    return score / len(recommended_items)