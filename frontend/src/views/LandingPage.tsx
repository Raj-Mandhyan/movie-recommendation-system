import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Database, Code, ShieldCheck, ArrowRight, Play, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, IMAGE_FALLBACK } from "../config";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ tmdb_id: number; title: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  // loadingSuggestions,
  const [, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // States for trending movies
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const trendingContainerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch search autocomplete suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/movies/search`, {
          params: { query: searchQuery }
        });
        setSuggestions(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch trending movies on load
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/movies/trending`, {
          params: { limit: 15 }
        });
        setTrendingMovies(res.data);
      } catch (err) {
        console.error("Failed to fetch trending movies", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSelectMovie = (title: string) => {
    navigate(`/recommend?movie=${encodeURIComponent(title)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectMovie(searchQuery.trim());
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold text-sm mb-6 shadow-lg shadow-amber-500/5 hover:scale-105 transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          <span>Next-Generation Film Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent max-w-4xl"
        >
          AI-Powered Movie Recommendation Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-gray-400 text-lg sm:text-xl max-w-2xl font-light leading-relaxed"
        >
          Fusing Content-Based tag similarity search and Collaborative latent-factor filtering to deliver precise cinematic discoveries.
        </motion.p>

        {/* 2. SEARCH BOX */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 w-full max-w-2xl relative"
          ref={dropdownRef}
        >
          <form onSubmit={handleSearchSubmit} className="relative z-20">
            <div className="glassmorphism rounded-2xl flex items-center p-2 focus-within:border-amber-500/40 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all duration-300">
              <Search className="h-6 w-6 text-gray-500 ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a movie (e.g., Avatar, Inception, Toy Story...)"
                className="w-full bg-transparent outline-none border-none py-3 px-3 text-white placeholder-gray-500 font-medium text-base sm:text-lg"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 flex items-center gap-1.5 text-black interactive"
              >
                <span>Discover</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-3 glassmorphism rounded-2xl overflow-hidden shadow-2xl z-30 border border-white/10"
              >
                <div className="py-2 max-h-80 overflow-y-auto no-scrollbar divide-y divide-white/5">
                  {suggestions.map((item) => (
                    <button
                      key={item.tmdb_id}
                      onClick={() => handleSelectMovie(item.title)}
                      className="w-full px-5 py-3 text-left hover:bg-amber-500/10 flex items-center justify-between group transition-colors interactive"
                    >
                      <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                      <Play className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. TRENDING MOVIES ROW (Streaming Hub Style) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-500 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Trending Blockbusters
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (trendingContainerRef.current) {
                  trendingContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
                }
              }}
              className="p-2 rounded-full glassmorphism hover:bg-white/10 text-white transition-all interactive"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                if (trendingContainerRef.current) {
                  trendingContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
                }
              }}
              className="p-2 rounded-full glassmorphism hover:bg-white/10 text-white transition-all interactive"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loadingTrending ? (
          <div className="flex gap-6 overflow-x-hidden py-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-[200px] shrink-0 aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            ref={trendingContainerRef}
            className="flex gap-6 overflow-x-auto py-4 scroll-smooth no-scrollbar select-none"
            style={{ scrollbarWidth: "none" }}
          >
            {trendingMovies.map((movie) => (
              <motion.div
                key={movie.tmdb_id}
                onClick={() => navigate(`/movie/${movie.tmdb_id}`)}
                whileHover={{ scale: 1.06, y: -4 }}
                transition={{ duration: 0.3 }}
                className="w-[200px] shrink-0 group relative aspect-[2/3] rounded-2xl overflow-hidden glassmorphism shadow-xl cursor-pointer border border-white/5 hover:border-amber-500/50 transition-all duration-300 interactive"
              >
                <img
                  src={movie.poster_url || IMAGE_FALLBACK}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Rate Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/75 border border-amber-500/30 text-[10px] font-bold text-amber-400 flex items-center gap-0.5 z-10">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-extrabold text-sm text-white leading-tight line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Pop: {Math.round(movie.popularity)}
                    </span>
                    <span className="text-gray-400 text-[10px] font-semibold">
                      {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Dataset Movies", count: "4,803+", desc: "Cleaned TMDB metadata corpus" },
            { label: "MovieLens Ratings", count: "100,836", desc: "Collaborative interaction matrix" },
            { label: "Latent Embeddings", count: "64-Dim", desc: "PyTorch matrix factorization" },
            { label: "Realtime Performance", count: "< 50ms", desc: "Indexed FAISS vector search" }
          ].map((stat, i) => (
            <div key={i} className="glassmorphism rounded-2xl p-6 text-center shadow-xl border border-white/5">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{stat.label}</span>
              <h3 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-white to-yellow-500 bg-clip-text text-transparent mt-2">
                {stat.count}
              </h3>
              <p className="text-xs text-gray-400 mt-2 font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECOMMENDATION ALGORITHMS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hybrid Recommendation Engine Architecture
          </h2>
          <p className="text-gray-400 mt-3 font-light">
            CineMind.AI uses a triple-engine mapping network that dynamically fuses multiple recommenders to defeat cold-start problems and rating bias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Database,
              title: "Content-Based Tags",
              tech: "FAISS + CountVectorizer",
              desc: "Tokenizes plots, keywords, directors, and actors to map L2-normalized cosine distances in high-dimensional vector space."
            },
            {
              icon: Code,
              title: "Collaborative Filtering",
              tech: "PyTorch Matrix Factorization",
              desc: "Deconstructs a user rating matrix into 64-dimensional user/item latent matrices to learn hidden behavioral patterns."
            },
            {
              icon: ShieldCheck,
              title: "Hybrid Score Fusion",
              tech: "Weighted Fusion Mapping",
              desc: "Min-Max normalizes candidate pools from content/collaborative paths and performs dynamic weighted linear scaling."
            }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="glassmorphism glassmorphism-hover rounded-2xl p-8 relative flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-wide text-white">{feat.title}</h3>
                  <span className="text-xs text-amber-400 font-bold tracking-widest uppercase mt-1 inline-block font-mono">
                    {feat.tech}
                  </span>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. INTERACTIVE ARCHITECTURE CANVAS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glassmorphism rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 border border-white/5">
          <div className="space-y-6 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Interactive Pipeline</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Adjust weights in real-time. Tune confidence.
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Open the AI Recommendations tab to access complete slider controls. Control mathematical weights assigned to content tags vs rating matrix patterns to see recommendations shift instantly.
            </p>
            <button
              onClick={() => navigate("/recommend")}
              className="px-6 py-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-white font-bold border border-amber-500/30 transition-all duration-300 flex items-center gap-2 interactive"
            >
              <span>Launch Engine Console</span>
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </button>
          </div>

          {/* Graphical Pipeline Box */}
          <div className="w-full lg:w-1/2 p-6 rounded-2xl bg-black/40 border border-white/5 relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-xs font-mono text-amber-500">1. Content Vector Path</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/25">FAISS Index Search</span>
              </div>
              <div className="flex justify-center text-gray-500 font-mono text-xs">⬇</div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-xs font-mono text-yellow-500">2. Collaborative Embedding Path</span>
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-mono border border-yellow-500/25">PyTorch Latent Math</span>
              </div>
              <div className="flex justify-center text-gray-500 font-mono text-xs">⬇</div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/20">
                <span className="text-xs font-mono text-white">3. Weighted Fused Recommendations</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-mono border border-white/20">Unified Ranked Output</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
