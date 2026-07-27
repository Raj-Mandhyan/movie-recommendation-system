import torch
import torch.nn as nn


class MatrixFactorization(nn.Module):

    def __init__(self, n_users, n_movies, embedding_dim=64):
        super().__init__()

        self.user_embedding = nn.Embedding(
            n_users,
            embedding_dim
        )

        self.movie_embedding = nn.Embedding(
            n_movies,
            embedding_dim
        )

        self.user_bias = nn.Embedding(
            n_users,
            1
        )

        self.movie_bias = nn.Embedding(
            n_movies,
            1
        )

    def forward(self, users, movies):

        user_vec = self.user_embedding(users)
        movie_vec = self.movie_embedding(movies)

        dot = (user_vec * movie_vec).sum(dim=1)

        bias = (
            self.user_bias(users).squeeze()
            + self.movie_bias(movies).squeeze()
        )

        return dot + bias