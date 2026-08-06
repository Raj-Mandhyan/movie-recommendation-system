// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BackgroundLayout } from "./components/BackgroundLayout";
import { LandingPage } from "./views/LandingPage";
import { RecommendationPage } from "./views/RecommendationPage";
import { MovieDetailsPage } from "./views/MovieDetailsPage";
import { AboutPage } from "./views/AboutPage";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen font-sans selection:bg-neon-violet/30 selection:text-white antialiased">
        {/* Animated Background Layers */}
        <BackgroundLayout />

        {/* Global Floating Glass Navigation bar */}
        <Navbar />

        {/* Page Content Routes */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recommend" element={<RecommendationPage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
