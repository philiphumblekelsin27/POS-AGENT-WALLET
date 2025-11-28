
import React, { useState, useEffect } from 'react';
import { mockStore } from '../services/mockStore';
import { Ad } from '../types';

export const AdBanner: React.FC = () => {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for ads every 10 seconds
    const interval = setInterval(() => {
      const ads = mockStore.getAds();
      if (ads.length > 0) {
        // Pick a random ad
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setCurrentAd(randomAd);
        setIsVisible(true);

        // Hide after 8 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 8000);
      }
    }, 15000); // Show a new ad every 15s

    return () => clearInterval(interval);
  }, []);

  if (!currentAd) return null;

  return (
    <div 
      className={`fixed bottom-20 right-4 z-40 max-w-xs w-full transform transition-all duration-700 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`p-4 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md text-white ${currentAd.color || 'bg-blue-600'}`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Sponsored</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="text-sm font-semibold leading-snug">
          {currentAd.text}
        </p>
      </div>
    </div>
  );
};
