import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/GISViewer.css';

function GISViewer({ geoJsonData, setLogs, bottomPanelOpen }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      mapInstanceRef.current = map;

      // Add event listeners
      map.on('moveend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Map moved."]);
      });
      map.on('zoomend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Zoom level changed."]);
      });

      // Add base tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }

    // Handle geoJsonData changes
    if (mapInstanceRef.current) {
      // Clear existing GeoJSON layer if it exists
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.removeFrom(mapInstanceRef.current);
        geoJsonLayerRef.current = null;
      }

      // Add new GeoJSON data if available
      if (geoJsonData) {
        const onEachFeature = (feature, layer) => {
          let popupContent = '<p><strong>Coordinates:</strong></p>';
          if (feature.geometry && feature.geometry.coordinates) {
            popupContent += JSON.stringify(feature.geometry.coordinates);
          }
          if (feature.properties) {
            popupContent += '<br/><strong>Properties:</strong> ' + JSON.stringify(feature.properties);
          }
          layer.bindPopup(popupContent);
        };

        const geoJsonLayer = L.geoJSON(geoJsonData, {
          onEachFeature: onEachFeature,
          pointToLayer: (feature, latlng) => {
            return L.marker(latlng);
          }
        });

        geoJsonLayer.addTo(mapInstanceRef.current);
        geoJsonLayerRef.current = geoJsonLayer;

        // Fit bounds to show all data points
        mapInstanceRef.current.fitBounds(geoJsonLayer.getBounds());

        setLogs((prevLogs) => [...prevLogs, "GeoJSON data loaded on map."]);
      } else {
        // Reset view when no data is present
        mapInstanceRef.current.setView([51.505, -0.09], 13);
        setLogs((prevLogs) => [...prevLogs, "Map reset - no GeoJSON data present."]);
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current && geoJsonLayerRef.current) {
        geoJsonLayerRef.current.removeFrom(mapInstanceRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [geoJsonData, setLogs]);

  // Handle resize when bottom panel changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 300); // Wait for panel animation to complete
    }
  }, [bottomPanelOpen]);

  return (
      <div
          ref={mapRef}
          style={{
            width: '100%',
            height: bottomPanelOpen ? '95%' : '87%',
            transition: 'height 0.3s ease-in-out'
          }}
      />
  );
}

export default GISViewer;