
import React, { useEffect, useRef, useState } from 'react';
import { Agent } from '../types';

interface AgentMapProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}

// --- CONFIGURATION ---
// PASTE YOUR GOOGLE MAPS API KEY HERE
// SECURITY NOTE: In Google Cloud Console, restrict this key to your domain (HTTP Referrer) to prevent unauthorized use.
const GOOGLE_MAPS_API_KEY: string = ''; 
// ---------------------

export const AgentMap: React.FC<AgentMapProps> = ({ agents, onSelectAgent }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useRealMap, setUseRealMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // 1. Check if API key is present to enable Real Map mode
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 5) {
        setUseRealMap(true);
        loadGoogleMapsScript();
    }
    
    // 2. Get User Location (Browser Geolocation)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(loc);
                // If map already loaded, pan to user
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo(loc);
                }
            },
            (error) => console.log("Geolocation permission denied or error:", error),
            { enableHighAccuracy: true }
        );
    }
  }, []);

  const loadGoogleMapsScript = () => {
      // Avoid duplicate script injection
      if (window.google && window.google.maps) {
          setMapLoaded(true);
          return;
      }
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
  };

  useEffect(() => {
    if (useRealMap && mapLoaded && window.google && mapRef.current) {
        initGoogleMap();
    }
  }, [useRealMap, mapLoaded, agents, userLocation]);

  const initGoogleMap = () => {
      if (!mapRef.current || !window.google) return;

      const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Default to Lagos
      const center = userLocation || defaultCenter;

      // Initialize Map Instance if not exists
      if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
              center: center,
              zoom: 13,
              disableDefaultUI: false,
              zoomControl: true,
              styles: [
                  {
                    "featureType": "poi",
                    "stylers": [{ "visibility": "off" }]
                  }
              ]
          });
      }
      
      const map = mapInstanceRef.current;

      // Clear existing markers to prevent duplicates on re-render
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // 1. Add User Marker (Blue Dot)
      if (userLocation) {
          const userMarker = new window.google.maps.Marker({
              position: userLocation,
              map: map,
              title: "You are here",
              icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "white",
              },
              zIndex: 999
          });
          markersRef.current.push(userMarker);
      }

      // 2. Add Agent Markers
      agents.forEach(agent => {
          if (agent.location) {
              const marker = new window.google.maps.Marker({
                  position: agent.location,
                  map: map,
                  title: agent.businessName,
                  icon: agent.isOnline 
                    ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' 
                    : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              });

              // InfoWindow for Agent
              const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div style="padding: 5px; color: black;">
                        <strong>${agent.businessName}</strong><br/>
                        Rating: ⭐ ${agent.rating}<br/>
                        Status: ${agent.isOnline ? '<span style="color:green">Online</span>' : '<span style="color:red">Offline</span>'}
                    </div>
                  `
              });

              marker.addListener('click', () => {
                  onSelectAgent(agent);
                  infoWindow.open(map, marker);
              });
              
              markersRef.current.push(marker);
          }
      });
  };

  const handleCenterOnUser = () => {
      if (userLocation && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(userLocation);
          mapInstanceRef.current.setZoom(15);
      } else if (navigator.geolocation) {
          // Retry fetching
          navigator.geolocation.getCurrentPosition((pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setUserLocation(loc);
          });
      } else {
          alert("Geolocation is not enabled.");
      }
  };

  // --- MOCK MAP RENDER (Fallback if no API Key) ---
  if (!useRealMap) {
      return (
        <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-300">
            {/* Abstract Map Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-b border-gray-300 opacity-20"></div>
                ))}
            </div>

            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-gray-600 shadow-sm z-10">
                Simulation Mode
            </div>

            {/* Agents */}
            {agents.map((agent) => (
                <button
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none group z-20"
                style={{
                    // Mock converting lat/lng to % position relative to a center point
                    left: `${50 + ((agent.location?.lng || 0) - 3.3792) * 2000}%`, 
                    top: `${50 + ((agent.location?.lat || 0) - 6.5244) * 2000}%`
                }}
                >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white ${agent.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}>
                    <span className="text-white text-xs font-bold">POS</span>
                    {agent.isOnline && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    )}
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {agent.businessName}
                </div>
                </button>
            ))}

            {/* User Location Mock */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/5 text-white p-1 text-[8px] text-center">
                Add API Key in components/AgentMap.tsx to enable Real Google Maps
            </div>
        </div>
      );
  }

  // --- REAL GOOGLE MAP RENDER ---
  return (
      <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden shadow-md border border-gray-200 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Recenter Button */}
          <button 
            onClick={handleCenterOnUser}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg text-blue-600 hover:bg-gray-50 focus:outline-none"
            title="Use My Location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-xs text-gray-500">Loading Google Maps...</p>
              </div>
          )}
      </div>
  );
};
