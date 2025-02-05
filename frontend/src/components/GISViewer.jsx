/**
 * @file GISViewer.js
 * @description Component for rendering GIS data using Leaflet.js with proper cleanup.
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/GISViewer.css';

const GISViewer = () => {
  // Reference for the map container div.
  const mapContainerRef = useRef(null);
  // Reference to store the Leaflet map instance.
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Create the Leaflet map using the container ref.
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);

      // Add OpenStreetMap tile layer.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add a sample marker with a popup.
      L.marker([51.5, -0.09]).addTo(mapInstanceRef.current)
        .bindPopup('A sample marker')
        .openPopup();
    }

    // Cleanup: only remove the map if its container still exists.
    return () => {
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current._container &&
        mapInstanceRef.current._container.parentNode
      ) {
        mapInstanceRef.current.remove();
      }
    };
  }, []); // Run only once on mount

  return (
    <div className="gis-viewer">
      {/* Use a ref instead of an id for the container */}
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default GISViewer;
