from src.evaluation.metrics import coverage

recommended = [1,2,3,4,5,6]
catalog = list(range(1,11))

print(
    coverage(
        recommended,
        catalog,
    )
)