/**
 * @file ThreeDViewer.js
 * @description Component for rendering 3D point cloud data using Three.js.
 */

import React, { useEffect, useRef } from 'react';
import '../styles/ThreeDViewer.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * ThreeDViewer component renders a point cloud using Three.js.
 * @param {object} props - React props.
 * @param {Array} props.pointCloudData - Array of [x, y, z] points.
 * @returns {JSX.Element} The 3D viewer container.
 */
const ThreeDViewer = ({ pointCloudData }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Create scene, camera, and renderer.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add orbit controls.
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 5);
    controls.update();

    // Create point cloud geometry.
    let geometry = new THREE.BufferGeometry();
    let positions, colors;
    let numPoints = 0;
    if (pointCloudData && pointCloudData.length > 0) {
      numPoints = pointCloudData.length;
      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);
      for (let i = 0; i < numPoints; i++) {
        const [x, y, z] = pointCloudData[i];
        positions.set([x, y, z], i * 3);
        // Color by altitude: map z to a blue-to-red gradient.
        const normalizedZ = (z + 10) / 20; // Adjust based on expected range.
        const r = normalizedZ;
        const g = 0;
        const b = 1 - normalizedZ;
        colors.set([r, g, b], i * 3);
      }
    } else {
      // Default demo point cloud (random points).
      numPoints = 1000;
      positions = new Float32Array(numPoints * 3);
      colors = new Float32Array(numPoints * 3);
      for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        positions.set([x, y, z], i * 3);
        const normalizedZ = (z + 5) / 10;
        const r = normalizedZ;
        const g = 0;
        const b = 1 - normalizedZ;
        colors.set([r, g, b], i * 3);
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create material that uses vertex colors.
    const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Animation loop.
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount.
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [pointCloudData]);

  return <div className="three-d-viewer" ref={mountRef}></div>;
};

export default ThreeDViewer;
