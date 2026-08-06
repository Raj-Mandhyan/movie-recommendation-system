import numpy as np

from src.evaluation.metrics import diversity

embeddings = np.array([
    [1,0],
    [0,1],
    [1,1],
])

print(
    diversity(
        embeddings,
    )
)