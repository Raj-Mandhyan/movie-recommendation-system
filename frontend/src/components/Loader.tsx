import React from "react";

export const ShimmerCard: React.FC = () => {
  return (
    <div className="glassmorphism rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      {/* Aspect ratio box representing movie poster */}
      <div className="aspect-[2/3] bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-white/10 rounded-md w-2/3" />
        <div className="h-3 bg-white/5 rounded-md w-1/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-white/5 rounded-full w-12" />
          <div className="h-6 bg-white/5 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Dual rotating rings */}
        <div className="absolute inset-0 rounded-full border-4 border-neon-violet/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-neon-violet animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-neon-cyan/10" />
        <div className="absolute inset-2 rounded-full border-4 border-t-neon-cyan animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
      </div>
      <p className="text-gray-400 font-medium text-sm animate-pulse">
        Retrieving latent embeddings...
      </p>
    </div>
  );
};

export const DetailsLoader: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="h-64 sm:h-96 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="aspect-[2/3] bg-white/5 rounded-2xl" />
        <div className="md:col-span-2 space-y-6">
          <div className="h-10 bg-white/10 rounded-lg w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
