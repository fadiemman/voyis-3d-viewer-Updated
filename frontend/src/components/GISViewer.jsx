// GISViewer.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/GISViewer.css';

function GISViewer({ geoJsonData, setLogs }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      mapInstanceRef.current = map;
      
      // Log zoom and move interactions
      map.on('moveend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Map moved."]);
      });
      map.on('zoomend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Zoom level changed."]);
      });

      // Add tile layer (OpenStreetMap by default)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.on('moveend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Map moved."]);
      });
      mapInstanceRef.current.on('zoomend', () => {
        setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Zoom level changed."]);
      });
    }


    // If we have GeoJSON data, add it to the map
    if (geoJsonData && mapInstanceRef.current) {
      // Clear existing GeoJSON layers first (if any)
      mapInstanceRef.current.eachLayer((layer) => {
        // Don’t remove the base tile layer
        if (layer.options && layer._leaflet_id !== undefined) {
          if (!layer._url) { // this check avoids removing tileLayer
            mapInstanceRef.current.removeLayer(layer);
          }
        }
      });

      // Create a Leaflet GeoJSON layer
      const onEachFeature = (feature, layer) => {
        // For each feature, you can set a popup or tooltip
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
        // You can also set custom marker icons, style polygons, etc.
        pointToLayer: (feature, latlng) => {
          // Marker for point geometry
          return L.marker(latlng);
        }
      });

      geoJsonLayer.addTo(mapInstanceRef.current);

      // Optionally fit bounds to the GeoJSON layer
      mapInstanceRef.current.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoJsonData]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default GISViewer;


// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import '../styles/GISViewer.css';

// function GISViewer({ geoJsonData, setLogs, bottomPanelOpen }) {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);

//   useEffect(() => {
//     if (mapRef.current && !mapInstanceRef.current) {
//       const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
//       mapInstanceRef.current = map;

//       map.on('moveend', () => {
//         setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Map moved."]);
//       });
//       map.on('zoomend', () => {
//         setLogs((prevLogs) => [...prevLogs, "GIS Map interaction: Zoom level changed."]);
//       });

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors',
//       }).addTo(map);
//     }

//     // Adjust the map size dynamically when the bottom panel state changes
//     const resizeObserver = new ResizeObserver(() => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.invalidateSize();
//       }
//     });
//     resizeObserver.observe(mapRef.current);

//     return () => {
//       resizeObserver.disconnect();
//     };
//   }, [bottomPanelOpen]);

//   return (
//     <div
//       ref={mapRef}
//       style={{
//         width: '100%',
//         height: `calc(100vh - ${bottomPanelOpen ? '200px' : '10px'})`,
//       }}
//     />
//   );
// }

// export default GISViewer;

