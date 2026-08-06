import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, User, Award, Film, ChevronLeft } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, IMAGE_FALLBACK } from "../config";
import { DetailsLoader } from "../components/Loader";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

interface MovieDetails {
  tmdb_id: number;
  title: string;
  overview: string;
  genres: string[];
  release_date: string;
  popularity: number;
  vote_average: number;
  runtime: number;
  poster_url?: string;
  backdrop_url?: string;
  logo_url?: string;
  tagline?: string;
  cast: CastMember[];
  director: string;
}

interface RecommendedMovie {
  tmdb_id: number;
  title: string;
  poster_url?: string;
  vote_average: number;
  score: number;
}

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch movie details
        const detailsRes = await axios.get(`${API_BASE_URL}/api/movies/${id}`);
        setMovie(detailsRes.data);

        // 2. Fetch recommendations for this movie's title
        const recsRes = await axios.post(`${API_BASE_URL}/api/recommend`, {
          movie: detailsRes.data.title,
          top_k: 5
        });
        setRecommendations(recsRes.data.recommendations);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch movie details. The database might not include this TMDB ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Extract and format poster image link from overview if appended by backend
  const renderOverviewAndPosterLink = (overviewText: string) => {
    const posterRegex = /\n\n\[Poster Image\]\((.*?)\)/;
    const match = overviewText.match(posterRegex);
    let cleanOverview = overviewText;
    let posterUrlFromDesc = "";

    if (match) {
      cleanOverview = overviewText.replace(posterRegex, "");
      posterUrlFromDesc = match[1];
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-200">Overview</h3>
          <p className="text-gray-400 text-sm leading-relaxed font-light">{cleanOverview}</p>
        </div>
        
        {posterUrlFromDesc && (
          <div className="mt-4 p-4 rounded-2xl glassmorphism border border-white/5 flex flex-col sm:flex-row items-center gap-4">
            <img 
              src={posterUrlFromDesc} 
              alt="Poster thumbnail" 
              className="w-16 h-24 object-cover rounded-lg border border-white/10 shrink-0 shadow-md"
            />
            <div className="space-y-1 text-center sm:text-left overflow-hidden w-full">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Verified Poster Link</span>
              <a 
                href={posterUrlFromDesc} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline break-all block font-mono"
              >
                {posterUrlFromDesc}
              </a>
              <span className="text-[9px] text-gray-500 block">Click the link above to view or download the high-resolution poster.</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <DetailsLoader />;
  
  if (error || !movie) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glassmorphism rounded-2xl text-center border-red-500/20 text-white z-10 relative">
        <Film className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h4 className="font-bold text-lg">Details Offline</h4>
        <p className="text-sm text-gray-400 mt-2">{error || "Movie details could not be retrieved."}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors interactive"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="text-white relative z-10 pb-16">
      
      {/* 1. CINEMATIC BACKDROP BANNER */}
      <div className="relative w-full h-[50vh] overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <img
          src={movie.backdrop_url || IMAGE_FALLBACK}
          alt={movie.title}
          className="w-full h-full object-cover opacity-30 object-center"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl glassmorphism border border-white/10 hover:border-white/20 text-sm font-semibold flex items-center gap-1 transition-colors interactive"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* 2. MOVIE METADATA GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-150px] relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Movie Poster card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glassmorphism rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
          >
            <img
              src={movie.poster_url || IMAGE_FALLBACK}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Right Column: Rich Info text */}
          <div className="md:col-span-2 space-y-6">
            <div>
              {movie.tagline && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2 font-mono">
                  {movie.tagline}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400 font-semibold">
                <span>{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.runtime} mins</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"} / 10</span>
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Overview & Extracted Poster Link */}
            {renderOverviewAndPosterLink(movie.overview)}

            {/* Popularity metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glassmorphism rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase block">Director</span>
                  <span className="text-sm font-bold text-white">{movie.director}</span>
                </div>
              </div>
              <div className="glassmorphism rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase block">Popularity Score</span>
                  <span className="text-sm font-bold text-white">{Math.round(movie.popularity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CAST SECTION */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              <span>Principal Cast</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {movie.cast.map((actor) => (
                <div key={actor.id} className="glassmorphism rounded-xl overflow-hidden p-2 border border-white/5 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-3">
                    <img
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight block line-clamp-1">{actor.name}</span>
                  <span className="text-[9px] text-gray-500 block mt-0.5 line-clamp-1">{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RECOMMENDED MOVIES PANEL */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Film className="h-5 w-5 text-amber-400 animate-pulse" />
              <span>Recommended Similar Discoveries</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.tmdb_id}
                  onClick={() => navigate(`/movie/${rec.tmdb_id}`)}
                  className="group cursor-pointer space-y-3 interactive"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden glassmorphism border border-white/5 shadow-lg group-hover:scale-[1.03] group-hover:border-amber-500/30 transition-all duration-300">
                    <img
                      src={rec.poster_url || IMAGE_FALLBACK}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-200 group-hover:text-white line-clamp-1 transition-colors leading-tight">
                      {rec.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-amber-400 font-bold">
                        {Math.round(rec.score * 100)}% match
                      </span>
                      <div className="flex items-center text-[10px] text-yellow-500 font-bold gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-500" />
                        <span>{rec.vote_average ? rec.vote_average.toFixed(1) : "0.0"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
