import os
import json
from pathlib import Path
import httpx
from dotenv import load_dotenv

load_dotenv()

CACHE_DIR = Path("data/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)
CACHE_FILE = CACHE_DIR / "tmdb_cache.json"

class TMDBService:
    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY")
        self.cache = self._load_cache()

    def _load_cache(self) -> dict:
        if CACHE_FILE.exists():
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_cache(self):
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_movie_details(self, tmdb_id: int) -> dict:
        """
        Fetch movie details (poster, backdrop, tagline, logo, cast) from TMDB API.
        Caches results locally to avoid redundant API calls.
        """
        str_id = str(tmdb_id)
        if str_id in self.cache:
            return self.cache[str_id]

        if not self.api_key or self.api_key == "your_tmdb_api_key_here":
            return self._get_fallback_details(tmdb_id)

        try:
            url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
            params = {
                "api_key": self.api_key,
                "append_to_response": "credits,images",
                "language": "en-US"
            }
            response = httpx.get(url, params=params, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                
                poster_path = data.get("poster_path")
                backdrop_path = data.get("backdrop_path")
                tagline = data.get("tagline", "")
                overview = data.get("overview", "")
                vote_average = data.get("vote_average", 0.0)
                release_date = data.get("release_date", "")
                runtime = data.get("runtime", 0)
                popularity = data.get("popularity", 0.0)
                
                logo_path = None
                images = data.get("images", {})
                logos = images.get("logos", [])
                if logos:
                    logo_path = logos[0].get("file_path")
                
                cast = []
                credits = data.get("credits", {})
                for actor in credits.get("cast", [])[:8]:
                    cast.append({
                        "id": actor.get("id"),
                        "name": actor.get("name"),
                        "character": actor.get("character"),
                        "profile_path": actor.get("profile_path")
                    })
                
                director = "Unknown"
                for crew_member in credits.get("crew", []):
                    if crew_member.get("job") == "Director":
                        director = crew_member.get("name")
                        break

                details = {
                    "tmdb_id": tmdb_id,
                    "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
                    "backdrop_url": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
                    "logo_url": f"https://image.tmdb.org/t/p/w500{logo_path}" if logo_path else None,
                    "tagline": tagline,
                    "overview": overview,
                    "vote_average": vote_average,
                    "release_date": release_date,
                    "runtime": runtime,
                    "popularity": popularity,
                    "cast": cast,
                    "director": director
                }

                self.cache[str_id] = details
                self._save_cache()
                return details
            else:
                return self._get_fallback_details(tmdb_id)
        except Exception:
            return self._get_fallback_details(tmdb_id)

    def _get_fallback_details(self, tmdb_id: int) -> dict:
        """
        Generate fallback details for offline / keyless execution.
        """
        fallbacks = {
            19995: { # Avatar
                "poster_url": "https://image.tmdb.org/t/p/w500/kyeqW65ueZOJ624tdaab0G8eYVq.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/8Y43POK65vmznsn6JvSDBn21Ar5.jpg",
                "tagline": "Enter the World of Pandora.",
            },
            285: { # Pirates of the Caribbean: At World's End
                "poster_url": "https://image.tmdb.org/t/p/w500/jGW10mS7CX44n1GDrVje156mg21.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/w5JqEqkrPyfs57F05634519965n.jpg",
                "tagline": "At the end of the world, the adventure begins.",
            },
            206647: { # Spectre
                "poster_url": "https://image.tmdb.org/t/p/w500/672kUaH1w7z9X1446FoJfWKA2df.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/89tD9Gg0VipRcr2R34D1W3dI0Pj.jpg",
                "tagline": "A cryptic message from Bond's past sends him on a trail to uncover a sinister organization.",
            },
            49026: { # The Dark Knight Rises
                "poster_url": "https://image.tmdb.org/t/p/w500/85cocsbpZ3OA651g8Qx42ZuCuLr.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/17Z5F7gD0r6M80nLhM97cEGlPsh.jpg",
                "tagline": "The Legend Ends.",
            }
        }
        
        if tmdb_id in fallbacks:
            fb = fallbacks[tmdb_id]
            return {
                "tmdb_id": tmdb_id,
                "poster_url": fb["poster_url"],
                "backdrop_url": fb["backdrop_url"],
                "logo_url": None,
                "tagline": fb["tagline"],
                "overview": "Detailed overview is loaded from local CSV.",
                "vote_average": 7.5,
                "release_date": "2009-12-10",
                "runtime": 150,
                "popularity": 100.0,
                "cast": [],
                "director": "James Cameron"
            }
            
        return {
            "tmdb_id": tmdb_id,
            "poster_url": None,
            "backdrop_url": None,
            "logo_url": None,
            "tagline": "Explore the cinema universe.",
            "overview": "Detailed overview is loaded from local CSV.",
            "vote_average": 7.0,
            "release_date": "Unknown",
            "runtime": 120,
            "popularity": 50.0,
            "cast": [],
            "director": "Unknown"
        }

tmdb_service = TMDBService()
