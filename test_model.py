import torch

from src.collaborative.model import MatrixFactorization

model = MatrixFactorization(
    n_users=610,
    n_movies=9724
)

users = torch.tensor([0, 1, 2])
movies = torch.tensor([10, 20, 30])

output = model(users, movies)

print(output)
print(output.shape)