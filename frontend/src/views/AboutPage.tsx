import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// Settings
import { Info, Database, BarChart3 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface AboutMetadata {
  dataset: {
    name: string;
    total_processed_movies: number;
    total_ratings: number;
    unique_users: number;
  };
  algorithms: Array<{
    name: string;
    features: string;
    model: string;
    details: string;
  }>;
}

export const AboutPage: React.FC = () => {
  const [metadata, setMetadata] = useState<AboutMetadata | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/about`);
        setMetadata(res.data);
      } catch (err) {
        console.error("Failed to load about metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white relative z-10 space-y-16">
      
      {/* 1. HEADER HERO */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold text-sm shadow-lg shadow-amber-500/5">
          <Info className="h-4 w-4" />
          <span>System Pipeline Explained</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          CineMind AI Architecture
        </h1>
        <p className="text-gray-400 font-light leading-relaxed">
          Detailed overview of our deep-learning algorithms, mathematical similarity metrics, and high-performance vector search indexes.
        </p>
      </section>

      {/* 2. REAL-TIME DATASET METRICS */}
      {metadata && (
        <section className="glassmorphism rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Database className="h-40 w-40 text-white" />
          </div>
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Database Status</span>
            <h2 className="text-2xl font-bold tracking-tight">Active Datasets & Corpus</h2>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Our models are trained on clean MovieLens and TMDB 5,000 movie lists, mapping user feedback scores to movie keyword catalogs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
            <div>
              <span className="text-xxs uppercase font-semibold text-gray-500">Corpus Name</span>
              <span className="text-lg font-bold text-white block mt-1 leading-none">{metadata.dataset.name}</span>
            </div>
            <div>
              <span className="text-xxs uppercase font-semibold text-gray-500">Total Catalog</span>
              <span className="text-lg font-bold text-amber-400 block mt-1 leading-none">
                {metadata.dataset.total_processed_movies} movies
              </span>
            </div>
            <div>
              <span className="text-xxs uppercase font-semibold text-gray-500">Ratings Loaded</span>
              <span className="text-lg font-bold text-yellow-500 block mt-1 leading-none">
                {metadata.dataset.total_ratings.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-xxs uppercase font-semibold text-gray-500">Corpus Users</span>
              <span className="text-lg font-bold text-white block mt-1 leading-none">
                {metadata.dataset.unique_users} active users
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. ALGORITHMS FLOW */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-center">Engine Walkthrough</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "1. Content Tags Path",
              desc: "Plots, genres, and cast elements are stems-preprocessed and mapped into a high-dimensional count matrix. FAISS runs normalized cosine similarity searches in milliseconds, generating initial candidate lists.",
              bullets: ["NLTK PorterStemmer", "Scikit-Learn CountVectorizer", "FAISS L2 Inner Product"]
            },
            {
              title: "2. Collaborative Matrix Path",
              desc: "PyTorch Matrix Factorization factorizes sparse movie interaction logs into 64-dimensional user and item vectors. Cosine similarity computes alignments in latent behavioral dimensions.",
              bullets: ["PyTorch Embedding Weights", "64 Latent Dimensions", "Cosine Similarity in Item Space"]
            },
            {
              title: "3. Linear Score Fusion",
              desc: "Normalizes raw ratings or distances into a unified [0, 1] range to avoid metric mismatch. A weighted linear sum fuses scores, applying configurable multipliers ($w$) dynamically.",
              bullets: ["Min-max Normalization", "Linear Weighted Fusion", "Adjustable Slider Metrics"]
            }
          ].map((item, idx) => (
            <div key={idx} className="glassmorphism rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">{item.desc}</p>
              </div>
              <div className="space-y-1.5 border-t border-white/5 pt-4">
                {item.bullets.map((bullet, bIdx) => (
                  <span key={bIdx} className="text-xxs font-mono font-bold block text-amber-400">
                    &bull; {bullet}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EVALUATION METRICS PANEL */}
      <section className="glassmorphism rounded-3xl p-8 sm:p-10 border border-white/5 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">Mathematical Verification</span>
          <h2 className="text-2xl font-bold tracking-tight">Offline Evaluation Metrics</h2>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            Our pipeline is audited offline against industry evaluation standards. These metrics ensure recommendation diversity and prevent popularity bias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
          {[
            {
              name: "NDCG @ K",
              desc: "Normalized Discounted Cumulative Gain measures ranked list quality, verifying that highly similar candidates appear first."
            },
            {
              name: "Precision & Recall @ K",
              desc: "Calculates the ratio of relevant recommendations that match the user's implicit watchlist within the top K results."
            },
            {
              name: "Novelty",
              desc: "Quantifies recommendation self-information. Higher novelty implies recommendations aren't just mainstream hits."
            },
            {
              name: "Diversity",
              desc: "Measures average pairwise cosine distance. High diversity prevents recommendations from containing only sequels."
            },
            {
              name: "Coverage",
              desc: "Measures what percentage of our entire 4,800+ catalog gets recommended over different query sequences."
            }
          ].map((metric, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-amber-400" />
                <span>{metric.name}</span>
              </span>
              <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">{metric.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
