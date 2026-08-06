from src.evaluation.metrics import novelty

recommended = [1,2,3,4,5]

popularity = {
    1:0.50,
    2:0.20,
    3:0.10,
    4:0.05,
    5:0.01,
}

print(
    novelty(
        recommended,
        popularity,
    )
)