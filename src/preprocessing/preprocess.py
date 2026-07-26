import ast

from nltk.stem.porter import PorterStemmer

ps = PorterStemmer()


def convert(text):
    """
    Extract all names from a TMDB JSON-like string.
    """
    L = []

    for i in ast.literal_eval(text):
        L.append(i["name"])

    return L


def convert3(text):
    """
    Extract the first three cast members.
    """
    L = []

    counter = 0

    for i in ast.literal_eval(text):
        if counter != 3:
            L.append(i["name"])
            counter += 1
        else:
            break

    return L


def fetch_director(text):
    """
    Extract the movie director.
    """
    L = []

    for i in ast.literal_eval(text):
        if i["job"] == "Director":
            L.append(i["name"])
            break

    return L


def stem(text):
    """
    Apply Porter stemming to every word.
    """
    y = []

    for i in text.split():
        y.append(ps.stem(i))

    return " ".join(y)