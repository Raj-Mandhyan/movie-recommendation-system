from src.collaborative.dataset import MovieLensDataset

dataset = MovieLensDataset("data/raw/ratings.csv")

print("Ratings :", len(dataset))
print("Users   :", len(dataset.user_to_idx))
print("Movies  :", len(dataset.movie_to_idx))

print(dataset[0])