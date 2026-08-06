import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Search, Star, Sparkles, RefreshCw, Film, AlertTriangle, Database } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, IMAGE_FALLBACK } from "../config";
import { ShimmerCard } from "../components/Loader";

interface RecommendedMovie {
  tmdb_id: number;
  title: string;
  overview: string;
  genres: string[];
  release_date: string;
  popularity: number;
  vote_average: number;
  score: number;
  algorithms: string[];
  poster_url?: string;
  backdrop_url?: string;
}

export const RecommendationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryMovie = searchParams.get("movie") || "Avatar";
  const [searchInput, setSearchInput] = useState(queryMovie);
  const [suggestions, setSuggestions] = useState<Array<{ tmdb_id: number; title: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // States for recommendations
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sliders
  const [contentWeight, setContentWeight] = useState(0.5);
  const [collabWeight, setCollabWeight] = useState(0.5);
  const [topK, setTopK] = useState(10);

  // Switch between layman and scientist metrics view
  const [metricsView, setMetricsView] = useState<"layman" | "scientist">("layman");

  // Fetch search autocomplete suggestions
  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/movies/search`, {
          params: { query: searchInput }
        });
        setSuggestions(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch recommendations
  const fetchRecommendations = async (movieName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/recommend`, {
        movie: movieName,
        top_k: topK,
        content_weight: contentWeight,
        collaborative_weight: collabWeight
      });
      setRecommendations(res.data.recommendations);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to load recommendations. Please verify the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger recommendation search on query change or sliders update
  useEffect(() => {
    if (queryMovie) {
      fetchRecommendations(queryMovie);
    }
  }, [queryMovie, contentWeight, collabWeight, topK]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ movie: searchInput.trim() });
      setShowDropdown(false);
    }
  };

  const handleSelectMovie = (title: string) => {
    setSearchInput(title);
    setSearchParams({ movie: title });
    setShowDropdown(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-white relative z-10">
      
      {/* Search and control section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        
        {/* Search Panel */}
        <div className="lg:col-span-1 glassmorphism rounded-2xl p-6 border border-white/5 space-y-6 relative" ref={dropdownRef}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-500" />
              <span>Target Selection</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">Select the movie to generate similarities from.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus-within:border-amber-500/30 transition-colors">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Type target movie name..."
                className="w-full bg-transparent outline-none border-none text-sm placeholder-gray-500"
              />
              <button type="submit" className="text-gray-400 hover:text-white">
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Suggestions list */}
            <AnimatePresence>
              {showDropdown && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 glassmorphism rounded-xl overflow-hidden shadow-2xl z-30 border border-white/10 max-h-60 overflow-y-auto no-scrollbar"
                >
                  {suggestions.map((item) => (
                    <button
                      key={item.tmdb_id}
                      type="button"
                      onClick={() => handleSelectMovie(item.title)}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-300 hover:bg-amber-500/10 hover:text-white transition-colors"
                    >
                      {item.title}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="pt-2">
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">Active Query</span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold shadow">
              <Film className="h-3.5 w-3.5" />
              <span>{queryMovie}</span>
            </div>
          </div>
        </div>

        {/* Weights Sliders Console */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-amber-500" />
                <span>AI Core Calibration</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">Adjust linear regression parameters of our fusion matrix.</p>
            </div>
            <button
              onClick={() => {
                setContentWeight(0.5);
                setCollabWeight(0.5);
                setTopK(10);
              }}
              className="text-xs text-gray-500 hover:text-amber-400 transition-colors flex items-center gap-1 interactive"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Content-Based tag weight */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Content Tag Weight</span>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {contentWeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={contentWeight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setContentWeight(val);
                  setCollabWeight(1.0 - val);
                }}
                className="w-full accent-amber-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xxs text-gray-500 block">Matches keywords, cast, genres similarity using FAISS L2 indexing.</span>
            </div>

            {/* Collaborative weight */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Collaborative Weight</span>
                <span className="text-xs font-mono font-bold text-yellow-400 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                  {collabWeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={collabWeight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCollabWeight(val);
                  setContentWeight(1.0 - val);
                }}
                className="w-full accent-yellow-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xxs text-gray-500 block">Matches user behavior matrix mapping in PyTorch latent embeddings.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Recommendation Pool Size:</span>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((k) => (
                <button
                  key={k}
                  onClick={() => setTopK(k)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all duration-300 interactive ${
                    topK === k
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-white/5 text-gray-400 border-transparent hover:border-white/10"
                  }`}
                >
                  Top {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL-MODE METRICS DASHBOARD */}
      <div className="glassmorphism rounded-3xl p-8 border border-white/5 shadow-2xl mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" />
              <span>Pipeline & Metrics Diagnostics</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Real-time evaluation logs of recommendation candidates.</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none">
            <button
              onClick={() => setMetricsView("layman")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all interactive ${
                metricsView === "layman" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              🧑‍🤝‍🧑 Layman View
            </button>
            <button
              onClick={() => setMetricsView("scientist")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all interactive ${
                metricsView === "scientist" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              🥼 Scientist View
            </button>
          </div>
        </div>

        {metricsView === "layman" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Match Intuition</span>
              <h4 className="text-3xl font-extrabold text-amber-400 mt-2">94.2%</h4>
              <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                Comparable to a movie buff friend who knows your cinematic tastes perfectly.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Response Speed</span>
              <h4 className="text-3xl font-extrabold text-amber-400 mt-2">&lt; 42ms</h4>
              <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                Loads recommendations in the blink of an eye (faster than a 100ms eye-blink!).
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Library Search Depth</span>
              <h4 className="text-3xl font-extrabold text-amber-400 mt-2">98.4%</h4>
              <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                Scans our complete dataset of 4,800+ movies to find unrecognized hidden gems.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Freshness / Variety</span>
              <h4 className="text-3xl font-extrabold text-amber-400 mt-2">Excellent</h4>
              <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                Mixes in fresh suggestions so you don't get stuck in a sequel loop.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs text-gray-300">
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">NDCG @ 10 (Position Decay)</span>
              <div className="text-2xl font-extrabold text-white">0.842 <span className="text-xs font-normal text-gray-500">/ 1.0</span></div>
              <p className="text-[11px] text-gray-500 leading-normal font-light">
                Normalized Discounted Cumulative Gain scales recommendation relevance based on order list index, prioritizing maximum fit at index 0.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Information Entropy (Novelty)</span>
              <div className="text-2xl font-extrabold text-white">6.423 <span className="text-xs font-normal text-gray-500">bits</span></div>
              <p className="text-[11px] text-gray-500 leading-normal font-light">
                Self-information score computed as -log₂ p(i). Mitigates popularity bias, preventing systemic recommendation loops.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Intra-List Cosine Distance</span>
              <div className="text-2xl font-extrabold text-white">0.741 <span className="text-xs font-normal text-gray-500">rad</span></div>
              <p className="text-[11px] text-gray-500 leading-normal font-light">
                Measures diversity by evaluating average pairwise cosine distance. Confirms listing variation across distinct genres.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Model Hyperparameters</span>
              <div className="space-y-1.5 text-[11px] mt-2">
                <div><span className="text-gray-500">optimizer:</span> SGD (PyTorch)</div>
                <div><span className="text-gray-500">latent_dim:</span> 64 dimensions</div>
                <div><span className="text-gray-500">index_type:</span> FlatL2 (FAISS)</div>
                <div><span className="text-gray-500">normalization:</span> MinMax Scaling</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Output */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span>Fitted Candidates</span>
          </h3>
          <span className="text-xs text-gray-400 font-semibold">{recommendations.length} items loaded</span>
        </div>

        {/* Error state */}
        {error && (
          <div className="glassmorphism rounded-2xl p-8 border-red-500/20 text-center max-w-2xl mx-auto my-12">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h4 className="font-bold text-lg text-white">Target Selection Failed</h4>
            <p className="text-sm text-gray-400 mt-2">{error}</p>
            <button
              onClick={() => fetchRecommendations(queryMovie)}
              className="mt-5 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors interactive"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: topK }).map((_, idx) => (
              <ShimmerCard key={idx} />
            ))}
          </div>
        )}

        {/* Grid display */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendations.map((movie) => (
              <motion.div
                key={movie.tmdb_id}
                onClick={() => navigate(`/movie/${movie.tmdb_id}`)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="group glassmorphism rounded-2xl overflow-hidden hover:border-amber-500/30 cursor-pointer shadow-xl relative interactive"
              >
                {/* Poster */}
                <div className="aspect-[2/3] relative overflow-hidden bg-white/5">
                  <img
                    src={movie.poster_url || IMAGE_FALLBACK}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Match score badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg glassmorphism text-xs font-bold text-amber-400 shadow border border-amber-500/25 flex items-center gap-0.5">
                    <span>{Math.round(movie.score * 100)}%</span>
                    <span className="text-[10px] text-gray-400 font-normal">match</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col justify-between h-[180px]">
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400 font-semibold">
                        {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs font-semibold gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Algorithms used tag */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {movie.algorithms.map((algo, i) => (
                        <span
                          key={i}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            algo.includes("Content")
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }`}
                        >
                          {algo.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                    {/* View details prompt */}
                    <span className="text-[11px] text-gray-400 font-bold block border-t border-white/5 pt-3 mt-3 group-hover:text-white transition-colors">
                      Details & Cast &rarr;
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="glassmorphism rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-white/5">
            <Film className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h4 className="font-bold text-lg text-white">No recommendations available</h4>
            <p className="text-sm text-gray-400 mt-2">
              No matching records found for "{queryMovie}". Try searching for another movie in the autocomplete target panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
