import React, { useEffect, useRef } from 'react';
import '../styles/ThreeDViewer.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// If needed: import ResizeObserver from '@juggle/resize-observer';

const ThreeDViewer = ({ pointCloudData, setLogs }) => {
  const mountRef = useRef(null);

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
      console.log("Point cloud data loaded with", numPoints, "points.");

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
      console.log("Computed center:", centerX, centerY, centerZ, "Scale factor:", scale);

      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);

      for (let i = 0; i < numPoints; i++) {
        let [x, y, z] = pointCloudData[i];
        x = (x - centerX) * scale;
        y = (y - centerY) * scale;
        z = (z - centerZ) * scale;
        positions.set([x, y, z], i * 3);

        let normalizedZ = (z + 5) / 10;
        normalizedZ = Math.max(0, Math.min(1, normalizedZ));
        colors.set([normalizedZ, 0, 1 - normalizedZ], i * 3);
      }
    } else {
      // No data => demo
      usingDemoData = true;
      numPoints = 1000;
      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);
      console.log("No point cloud data provided. Using demo data with", numPoints, "points.");

      for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        positions.set([x, y, z], i * 3);
        let normalizedZ = (z + 5) / 10;
        normalizedZ = Math.max(0, Math.min(1, normalizedZ));
        colors.set([normalizedZ, 0, 1 - normalizedZ], i * 3);
      }

      // Create the "Demo Data Loaded" overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '10px';
      overlay.style.left = '10px';
      overlay.style.color = 'white';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.padding = '5px';
      overlay.innerHTML = 'Demo Data Loaded';
      mountRef.current.appendChild(overlay);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // ResizeObserver to handle toggling sidebar or container size changes
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    ro.observe(mountRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      //ro.unobserve(mountRef.current);
      if (mountRef.current) {
        ro.unobserve(mountRef.current);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        const existingOverlay = mountRef.current.querySelector('div[style*="absolute"]');
        if (existingOverlay) mountRef.current.removeChild(existingOverlay);
      }
    };
  }, [pointCloudData]);

  return (
    <div
      className="three-d-viewer"
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    ></div>
  );
};

export default ThreeDViewer;
