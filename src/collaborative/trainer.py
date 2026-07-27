from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.optim import Adam
from tqdm import tqdm

from src.collaborative.dataset import MovieLensDataset
from src.collaborative.model import MatrixFactorization


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

DATASET_PATH = "data/raw/ratings.csv"

MODEL_DIR = Path("models/collaborative_model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "matrix_factorization.pth"


def train():

    dataset = MovieLensDataset(DATASET_PATH)

    dataloader = DataLoader(
        dataset,
        batch_size=1024,
        shuffle=True,
    )

    model = MatrixFactorization(
        n_users=len(dataset.user_to_idx),
        n_movies=len(dataset.movie_to_idx),
        embedding_dim=64,
    ).to(DEVICE)

    criterion = nn.MSELoss()

    optimizer = Adam(
        model.parameters(),
        lr=0.001,
    )

    epochs = 20

    for epoch in range(epochs):

        model.train()

        running_loss = 0.0

        progress = tqdm(
            dataloader,
            desc=f"Epoch {epoch+1}/{epochs}",
        )

        for users, movies, ratings in progress:

            users = users.to(DEVICE)
            movies = movies.to(DEVICE)
            ratings = ratings.to(DEVICE)

            predictions = model(users, movies)

            loss = criterion(
                predictions,
                ratings,
            )

            optimizer.zero_grad()

            loss.backward()

            optimizer.step()

            running_loss += loss.item()

            progress.set_postfix(
                loss=loss.item(),
            )

        epoch_loss = running_loss / len(dataloader)

        print(f"\nAverage Loss: {epoch_loss:.4f}\n")

    torch.save(
        model.state_dict(),
        MODEL_PATH,
    )

    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()