
import React, { useEffect, useRef, useState } from 'react';
import { Agent } from '../types';
import { Globe } from 'lucide-react';

interface AgentMapProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}

// Security Note: Replace this placeholder with your production Google Maps API Key in Google Cloud Console.
const GOOGLE_MAPS_API_KEY: string = process.env.GOOGLE_MAPS_API_KEY || ''; 

export const AgentMap: React.FC<AgentMapProps> = ({ agents, onSelectAgent }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY) {
        loadGoogleMapsScript();
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
            (error) => console.debug("Geolocation disabled:", error),
            { enableHighAccuracy: true }
        );
    }
  }, []);

  const loadGoogleMapsScript = () => {
      if ((window as any).google?.maps) {
          setMapLoaded(true);
          return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
  };

  useEffect(() => {
    if (mapLoaded && (window as any).google && mapRef.current) {
        initGoogleMap();
    }
  }, [mapLoaded, agents, userLocation]);

  const initGoogleMap = () => {
      if (!mapRef.current || !(window as any).google) return;
      const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos Hub
      const center = userLocation || defaultCenter;

      if (!mapInstanceRef.current) {
          mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
              center: center,
              zoom: 14,
              disableDefaultUI: true,
              styles: [
                  { "featureType": "all", "elementType": "all", "stylers": [{ "invert_lightness": true }, { "saturation": -100 }, { "lightness": -60 }] },
                  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
              ]
          });
      }
      
      const map = mapInstanceRef.current;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      agents.forEach(agent => {
          if (agent.location) {
              const marker = new (window as any).google.maps.Marker({
                  position: agent.location,
                  map: map,
                  title: agent.businessName,
                  icon: {
                      path: (window as any).google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: agent.isOnline ? "#3DF2C4" : "#EF4444",
                      fillOpacity: 1,
                      strokeWeight: 4,
                      strokeColor: "black",
                  }
              });
              marker.addListener('click', () => onSelectAgent(agent));
              markersRef.current.push(marker);
          }
      });
  };

  if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="relative w-full h-full bg-[#141821] rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-12 text-center border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-[#3DF2C4]">
               <Globe size={32} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Real-Time Oracle Map</h4>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Provision GOOGLE_MAPS_API_KEY in environment to enable production map node.</p>
        </div>
      );
  }

  return <div ref={mapRef} className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10" />;
};
