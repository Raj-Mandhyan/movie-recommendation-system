from src.evaluation.metrics import (
    precision_at_k,
    recall_at_k,
    ndcg_at_k,
    average_precision_at_k,
)

recommended = [
    1,
    2,
    3,
    4,
    5,
]

relevant = [
    2,
    4,
    6,
]

print(
    precision_at_k(
        recommended,
        relevant,
        5,
    )
)

print(
    recall_at_k(
        recommended,
        relevant,
        5,
    )
)

print(
    ndcg_at_k(
        recommended,
        relevant,
        5,
    )
)

print(
    average_precision_at_k(
        recommended,
        relevant,
        5,
    )
)