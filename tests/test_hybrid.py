from src.hybrid.hybrid import HybridRecommender

hybrid = HybridRecommender(None, None, None)

content = {
    1: 0.90,
    2: 0.80,
    3: 0.50,
}

embedding = {
    1: 0.85,
    3: 0.95,
    4: 0.70,
}

collaborative = {
    2: 4.8,
    3: 4.2,
    4: 3.7,
}

# scores = hybrid.weighted_fusion(
#     content,
#     embedding,
#     collaborative,
# )

# print(scores)

recommendations = hybrid.recommend_top_k(
    content,
    embedding,
    collaborative,
    k=3,
)

print(recommendations)