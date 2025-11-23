"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing Leaflet icons in Next.js
// We check if window is defined to avoid SSR issues with Leaflet
const icon = typeof window !== 'undefined' ? L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : undefined;

interface MapProps {
  originalCoords?: [number, number][];
  optimizedCoords?: [number, number][];
}

export default function MapComponent({ originalCoords, optimizedCoords }: MapProps) {
  // Center roughly on Japan if no coords, or the first point
  const center: [number, number] = originalCoords && originalCoords.length > 0 
    ? originalCoords[0] 
    : [35.6895, 139.6917]; // Tokyo fallback

  return (
    <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Draw Original Route (Red/Gray dashed) if exists */}
      {originalCoords && (
        <Polyline 
          positions={originalCoords} 
          pathOptions={{ color: 'gray', dashArray: '10, 10', weight: 4, opacity: 0.6 }} 
        />
      )}

      {/* Draw Optimized Route (Green) if exists */}
      {optimizedCoords && (
        <>
          <Polyline 
            positions={optimizedCoords} 
            pathOptions={{ color: '#10b981', weight: 6 }} 
          />
          {/* Markers for the optimized stops */}
          {optimizedCoords.map((coord, idx) => (
            <Marker key={idx} position={coord} icon={icon}>
              <Popup>Stop #{idx + 1}</Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
}