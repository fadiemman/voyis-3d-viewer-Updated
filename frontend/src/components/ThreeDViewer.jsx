// ThreeDViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../styles/ThreeDViewer.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDViewer = ({ pointCloudData, setLogs }) => {
  const mountRef = useRef(null);
  const [pointSize, setPointSize] = useState(0.2); // Default point size
  const [colorByAltitude, setColorByAltitude] = useState(false); // Altitude color toggle
  const [panEnabled, setPanEnabled] = useState(true); // Pan toggle

  useEffect(() => {
    // Basic setup
    const scene = new THREE.Scene();
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 15);
    controls.update();
    controls.enablePan = panEnabled; // Set pan based on toggle

    // Log interactions in the 3D Viewer
    controls.addEventListener('change', () => {
      setLogs((prevLogs) => [...prevLogs, "3D Viewer interaction: Scene updated."]);
    });

    let geometry = new THREE.BufferGeometry();
    let positions, colors;
    let numPoints = 0;
    let usingDemoData = false;

    // If we have real data:
    if (pointCloudData && pointCloudData.length > 0) {
      numPoints = pointCloudData.length;

      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      pointCloudData.forEach(([x, y, z]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
      });
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;
      const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
      const scale = 10 / maxDim;

      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);

      for (let i = 0; i < numPoints; i++) {
        let [x, y, z] = pointCloudData[i];
        x = (x - centerX) * scale;
        y = (y - centerY) * scale;
        z = (z - centerZ) * scale;
        positions.set([x, y, z], i * 3);

        if (colorByAltitude) {
          // Color by altitude (z-coordinate)
          const normalizedZ = (z + 5) / 10; // Normalize Z to [0, 1]
          colors.set([normalizedZ, 0, 1 - normalizedZ], i * 3);
        } else {
          // Default color (blue)
          colors.set([0, 0, 1], i * 3);
        }
      }
    } else {
      // Demo data
      usingDemoData = true;
      numPoints = 1000;
      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);

      for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        positions.set([x, y, z], i * 3);

        if (colorByAltitude) {
          const normalizedZ = (z + 5) / 10;
          colors.set([normalizedZ, 0, 1 - normalizedZ], i * 3);
        } else {
          colors.set([0, 0, 1], i * 3);
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: pointSize, // Dynamic point size
      vertexColors: true,
    });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    const resizeObserver = new ResizeObserver(() => {
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(mountRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [pointCloudData, pointSize, colorByAltitude, panEnabled]);

  return (
    <div className="three-d-viewer" ref={mountRef}>
      {/* Controls */}
      <div className="viewer-controls">
        <button onClick={() => setPanEnabled(!panEnabled)}>
          {panEnabled ? "Disable Pan" : "Enable Pan"}
        </button>
        <label>
          Point Size:
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.01"
            value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
          />
        </label>
        <button onClick={() => setColorByAltitude(!colorByAltitude)}>
          {colorByAltitude ? "Disable Color by Altitude" : "Enable Color by Altitude"}
        </button>
      </div>
    </div>
  );
};

export default ThreeDViewer;
