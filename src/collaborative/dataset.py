import pandas as pd
import torch
from torch.utils.data import Dataset


class MovieLensDataset(Dataset):

    def __init__(self, ratings_path):

        self.df = pd.read_csv(ratings_path)

        self.user_to_idx = {
            user: idx
            for idx, user in enumerate(self.df["userId"].unique())
        }

        self.movie_to_idx = {
            movie: idx
            for idx, movie in enumerate(self.df["movieId"].unique())
        }

        self.idx_to_user = {
            v: k for k, v in self.user_to_idx.items()
        }

        self.idx_to_movie = {
            v: k for k, v in self.movie_to_idx.items()
        }

        self.users = torch.tensor(
            self.df["userId"].map(self.user_to_idx).values,
            dtype=torch.long,
        )

        self.movies = torch.tensor(
            self.df["movieId"].map(self.movie_to_idx).values,
            dtype=torch.long,
        )

        self.ratings = torch.tensor(
            self.df["rating"].values,
            dtype=torch.float32,
        )

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        return (
            self.users[idx],
            self.movies[idx],
            self.ratings[idx],
        )