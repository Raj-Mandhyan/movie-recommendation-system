# CineMind AI: Premium Movie Recommendation Platform

CineMind AI is a production-grade, full-stack Movie Recommendation platform designed like a premium streaming service. It acts as an interactive wrapper around a hybrid machine learning pipeline: **Content-Based Vector Search (FAISS + CountVectorizer)** and **Collaborative filtering (PyTorch Matrix Factorization)**.

---

## 🚀 Key Features

- **Drifting Poster Background**: Cinematic slowly moving poster marquees spanning Hollywood, Marvel, Sci-Fi, Anime, and classic sagas.
- **HTML5 Canvas Particle Emitter**: Floating fireflies and nebular dust layer that responds to mouse hover.
- **Aurora Mesh Blobs**: Moving gradient mesh blobs shifting positions dynamically.
- **Comet Tail Cursor**: Smoothly interpolated mouse trailer mix-blended with page content.
- **Calibration Console**: Slider controls to tune Content tag weights vs user collaborative rating weights in real-time.
- **Cinematic Detail Overlays**: Broad backdrop banners, cast list grids, runtimes, popularity scores, and similar discoveries.
- **Offline TMDB Cache**: In-memory and local file caching that saves resolved poster and backdrop links.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React, TypeScript, Vite
- **Animations**: Framer Motion, GSAP (GreenSock)
- **Styling**: TailwindCSS (v4 CSS-native theme variables)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide Icons
- **HTTP Client**: Axios

### Backend
- **Core**: Python (>=3.11)
- **Framework**: FastAPI (Pydantic models, CORS middleware)
- **Scientific Computations**: NumPy, Pandas, PyTorch
- **Vector Indexing**: FAISS (Facebook AI Similarity Search)
- **Web Server**: Uvicorn

---

## 📁 Repository Directory Structure

```text
movie-recommendation-system/
├── data/
│   ├── processed/            # Cleaned movies_processed.csv (TMDB metadata tags)
│   └── raw/                  # MovieLens ratings.csv, links.csv, tmdb_5000_movies.csv
├── models/
│   ├── collaborative_model/  # Trained PyTorch matrix_factorization.pth
│   ├── faiss.index           # Vector similarity index
│   └── vectorizer.joblib     # CountVectorizer vocabulary mapping
├── src/                      # Backend Core code
│   ├── api/                  # FastAPI routers, app configuration, and validation schemas
│   ├── services/             # TMDB poster integrations & Recommender similarity services
│   ├── hybrid/               # Hybrid recommender score normalization and fusion logic
│   └── collaborative/        # PyTorch dataset definitions and model modules
├── frontend/                 # React TypeScript UI client code
│   ├── src/
│   │   ├── components/       # Background canvas layers, Navbar, Loading shimmers
│   │   ├── views/            # LandingPage, RecommendationPage, MovieDetails, AboutPage
│   │   ├── config.ts         # Port mappings & fallbacks
│   │   └── App.tsx           # Page router configurations
│   └── index.html
├── requirements.txt          # Python virtual env dependencies
└── pyproject.toml            # Backend setuptools metadata
```

---

## ⚙️ Setup & Installation Guide

### 1. Backend Server Setup
From the repository root:
1. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Install the backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Set up the environment variables in a `.env` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```
4. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn src.api.main:app --host 127.0.0.1 --port 8005 --reload
   ```
   *The server will initialize at `http://127.0.0.1:8005`.*

### 2. Frontend client Setup
From a separate terminal window:
1. Navigate into the frontend folder:
   ```powershell
   cd frontend
   ```
2. Install client node modules:
   ```powershell
   npm install
   ```
3. Launch the Vite hot-reloading development server:
   ```powershell
   npm run dev -- --port 5173 --host 127.0.0.1
   ```
   *The client interface will load at `http://127.0.0.1:5173/`.*

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
Vite builds optimized files to the `frontend/dist` directory. To deploy on Vercel:
1. Install Vercel CLI or import the GitHub repository in the Vercel Dashboard.
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `frontend`.
4. Ensure the **Build Command** is `tsc -b && vite build`.
5. Specify `API_BASE_URL` in `frontend/src/config.ts` or set it to point to your hosted backend.

### Backend (Render / Railway)
FastAPI can be served as a Docker container or directly as a Python service:
1. Specify **Build Command**: `pip install -r requirements.txt`.
2. Specify **Start Command**: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`.
3. Add the `TMDB_API_KEY` to the environment variables settings on your hosting provider.