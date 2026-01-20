
import React, { useEffect } from 'react';

interface GoogleAdProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

// PASTE YOUR GOOGLE ADSENSE PUBLISHER ID HERE
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; 

export const GoogleAd: React.FC<GoogleAdProps> = ({ slotId, format = 'auto', className }) => {
  useEffect(() => {
    try {
      // Fix: Cast window to any to access adsbygoogle
      if ((window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // If no publisher ID is set (dev mode), show a placeholder
  if (PUBLISHER_ID === 'ca-pub-XXXXXXXXXXXXXXXX') {
      return (
          <div className={`bg-gray-100 border border-gray-300 text-gray-400 text-xs flex items-center justify-center p-4 rounded-lg text-center ${className}`}>
              <div className="space-y-1">
                  <p className="font-bold">Google Ad Placeholder</p>
                  <p>Slot ID: {slotId}</p>
                  <p className="text-[10px]">(Configure PUBLISHER_ID in components/GoogleAd.tsx)</p>
              </div>
          </div>
      );
  }

  return (
    <div className={`my-4 overflow-hidden rounded-lg ${className}`}>
      <ins
        className="adsbygoogle block"
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        style={{ display: 'block' }}
      ></ins>
    </div>
  );
};
