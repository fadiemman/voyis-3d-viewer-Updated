/**
 * @file ThreeDViewer.js
 * @description Component for rendering 3D point cloud data using Three.js.
 *
 * This component accepts an array of [x, y, z] points (via props.pointCloudData).
 * If pointCloudData is provided, it computes the bounding box, centers and scales the data,
 * then creates a BufferGeometry to render the point cloud with vertex colors (color by altitude).
 * Basic interaction is enabled via OrbitControls (pan, zoom, rotate).
 *
 * If no data is provided, it falls back to demo data and displays an overlay message.
 */

import React, { useEffect, useRef } from 'react';
import '../styles/ThreeDViewer.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDViewer = ({ pointCloudData }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Create Three.js scene, camera, and renderer.
    const scene = new THREE.Scene();
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Enable orbit controls for pan, zoom, and rotate.
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 15);
    controls.update();

    let geometry = new THREE.BufferGeometry();
    let positions, colors;
    let numPoints = 0;
    let usingDemoData = false;

    if (pointCloudData && pointCloudData.length > 0) {
      numPoints = pointCloudData.length;
      console.log("Point cloud data loaded with", numPoints, "points.");

      // Compute bounding box for the uploaded point cloud.
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
      // Choose a scale factor so that the largest dimension becomes ~10 units.
      const scale = 10 / maxDim;
      console.log("Computed center:", centerX, centerY, centerZ, "Scale factor:", scale);

      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);
      for (let i = 0; i < numPoints; i++) {
        let [x, y, z] = pointCloudData[i];
        // Center and scale the point.
        x = (x - centerX) * scale;
        y = (y - centerY) * scale;
        z = (z - centerZ) * scale;
        positions.set([x, y, z], i * 3);

        // Map z (altitude) to a color gradient (blue-to-red).
        let normalizedZ = (z + 5) / 10; // Adjust this based on your data range.
        normalizedZ = Math.max(0, Math.min(1, normalizedZ));
        colors.set([normalizedZ, 0, 1 - normalizedZ], i * 3);
      }
    } else {
      // No point cloud data provided: use demo random data.
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
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // If using demo data, display an overlay message.
    if (usingDemoData) {
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '10px';
      overlay.style.left = '10px';
      overlay.style.color = 'white';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.padding = '5px';
      overlay.innerHTML = 'Demo Data Loaded (No file uploaded)';
      mountRef.current.appendChild(overlay);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup: remove the renderer's DOM element.
    const currentMount = mountRef.current;
    return () => {
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
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
