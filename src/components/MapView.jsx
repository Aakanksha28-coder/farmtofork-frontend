import React, { useEffect, useRef } from 'react';
import './MapView.css';

// Lightweight Leaflet loader without adding to package.json; use CDN
const LeafletLoader = {
  loaded: false,
  load() {
    return new Promise((resolve, reject) => {
      if (this.loaded) return resolve(window.L);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { this.loaded = true; resolve(window.L); };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
};

const MapView = ({ center, marker, height = 320, zoom = 13 }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    LeafletLoader.load().then((L) => {
      if (disposed) return;
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
      } else {
        mapInstance.current.setView([center.lat, center.lng], zoom);
      }
      if (marker) {
        if (!markerRef.current) {
          markerRef.current = L.marker([marker.lat, marker.lng]).addTo(mapInstance.current);
        } else {
          markerRef.current.setLatLng([marker.lat, marker.lng]);
        }
      }
    });
    return () => { disposed = true; };
  }, [center.lat, center.lng, zoom, marker?.lat, marker?.lng]);

  return <div className="map-view" style={{ height }} ref={mapRef} />;
};

export default MapView;
