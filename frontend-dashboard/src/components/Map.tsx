"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

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
  originalWaypoints?: [number, number][];
  optimizedWaypoints?: [number, number][];
}

function MapUpdater({ coords }: { coords?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

export default function MapComponent({
  originalCoords,
  optimizedCoords,
  originalWaypoints,
  optimizedWaypoints
}: MapProps) {
  const center: [number, number] = originalWaypoints && originalWaypoints.length > 0
    ? originalWaypoints[0]
    : [35.6895, 139.6917];

  return (
    <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater coords={optimizedCoords || originalCoords} />

      {originalCoords && (
        <Polyline
          positions={originalCoords}
          pathOptions={{ color: 'gray', dashArray: '10, 10', weight: 4, opacity: 0.6 }}
        />
      )}

      {optimizedCoords && (
        <Polyline
          positions={optimizedCoords}
          pathOptions={{ color: '#10b981', weight: 6 }}
        />
      )}

      {optimizedWaypoints && optimizedWaypoints.map((coord, idx) => (
        <Marker key={idx} position={coord} icon={icon}>
          <Popup>Stop #{idx + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}