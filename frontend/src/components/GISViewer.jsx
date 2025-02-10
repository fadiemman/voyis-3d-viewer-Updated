// GISViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/GISViewer.css';

function GISViewer({ geoJsonData, setLogs, bottomPanelOpen }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRange, setTimeRange] = useState([0, 100]);
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      map.on('moveend', () => setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Map moved."]));
      map.on('zoomend', () => setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Zoom level changed."]));
    }

    if (geoJsonData && mapInstanceRef.current) {
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.removeFrom(mapInstanceRef.current);
      }

      const timestamps = geoJsonData.features
          .map((feature) => feature.properties?.timestamp)
          .filter((timestamp) => timestamp !== undefined);

      if (timestamps.length > 0) {
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        setTimeRange([minTime, maxTime]);
        setCurrentTime(minTime);
      }

      geoJsonLayerRef.current = L.geoJSON(geoJsonData, {
        filter: (feature) => !feature.properties.timestamp || feature.properties.timestamp <= currentTime,
        onEachFeature: (feature, layer) => {
          let popupContent = `<strong>Metadata:</strong><br>`;
          if (feature.geometry && feature.geometry.coordinates) {
            popupContent += `<strong>Coordinates:</strong> ${feature.geometry.coordinates.join(', ')}<br>`;
          }
          if (feature.properties) {
            const { timestamp, tags, description } = feature.properties;
            if (timestamp) popupContent += `<strong>Timestamp:</strong> ${timestamp}<br>`;
            if (tags) popupContent += `<strong>Tags:</strong> ${tags}<br>`;
            if (description) popupContent += `<strong>Description:</strong> ${description}<br>`;
          }
          layer.bindPopup(popupContent);
        },
      }).addTo(mapInstanceRef.current);

      const bounds = geoJsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoJsonData, currentTime, setLogs]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) =>
          prevTime < timeRange[1] ? prevTime + 1 : timeRange[0]
        );
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRange]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: bottomPanelOpen ? '95%' : '87%',
          transition: 'height 0.3s ease-in-out',
        }}
      />
      {geoJsonData && timeRange[1] > timeRange[0] && (
        <div className="time-controls" style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ marginRight: '10px' }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={timeRange[0]}
            max={timeRange[1]}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
          />
          <span style={{ marginLeft: '10px' }}>{currentTime}</span>
        </div>
      )}
    </div>
  );
}

export default GISViewer;


