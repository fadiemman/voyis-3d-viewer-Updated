/**
 * @file FileUpload.js
 * @description Component to handle file uploads (click or drag-and-drop) and parse point cloud data.
 */

import React, { useState } from 'react';
import '../styles/FileUpload.css';

const FileUpload = ({ onPointCloudUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  /**
   * Parse a .pcd file content (assuming ASCII format).
   * @param {string} content - The file text.
   * @returns {object} An object with an array of points and metadata.
   */
  const parsePCD = (content) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let dataStart = 0;
    let points = [];
    const meta = {
      numPoints: 0,
      boundingBox: { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity }
    };
    // Find the header line "DATA ascii" (case-insensitive).
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toUpperCase().startsWith('DATA')) {
        dataStart = i + 1;
        break;
      }
    }
    // Parse each data line.
    for (let i = dataStart; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/);
      if (parts.length >= 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        points.push([x, y, z]);
        if (x < meta.boundingBox.minX) meta.boundingBox.minX = x;
        if (y < meta.boundingBox.minY) meta.boundingBox.minY = y;
        if (z < meta.boundingBox.minZ) meta.boundingBox.minZ = z;
        if (x > meta.boundingBox.maxX) meta.boundingBox.maxX = x;
        if (y > meta.boundingBox.maxY) meta.boundingBox.maxY = y;
        if (z > meta.boundingBox.maxZ) meta.boundingBox.maxZ = z;
      }
    }
    meta.numPoints = points.length;
    return { points, meta };
  };

  /**
   * Parse a .xyz file content.
   * @param {string} content - The file text.
   * @returns {object} An object with an array of points and metadata.
   */
  const parseXYZ = (content) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let points = [];
    const meta = {
      numPoints: 0,
      boundingBox: { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity }
    };
    for (let line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        points.push([x, y, z]);
        if (x < meta.boundingBox.minX) meta.boundingBox.minX = x;
        if (y < meta.boundingBox.minY) meta.boundingBox.minY = y;
        if (z < meta.boundingBox.minZ) meta.boundingBox.minZ = z;
        if (x > meta.boundingBox.maxX) meta.boundingBox.maxX = x;
        if (y > meta.boundingBox.maxY) meta.boundingBox.maxY = y;
        if (z > meta.boundingBox.maxZ) meta.boundingBox.maxZ = z;
      }
    }
    meta.numPoints = points.length;
    return { points, meta };
  };

  /**
   * Process the uploaded file: read its content, parse it, and simulate upload progress.
   * @param {File} file - The uploaded file.
   */
  const processFile = (file) => {
    setFileInfo({
      name: file.name,
      size: file.size,
    });
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      let result;
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'pcd') {
        result = parsePCD(content);
      } else if (extension === 'xyz') {
        result = parseXYZ(content);
      } else {
        // You can add additional handling for GeoJSON if needed.
        return;
      }
      // Simulate upload progress.
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(simulateProgress);
          setUploadProgress(100);
          if (onPointCloudUpload) {
            onPointCloudUpload(result.points, result.meta);
          }
        }
      }, 100);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      processFile(file);
      event.dataTransfer.clearData();
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload Files</h2>
      <input
        type="file"
        accept=".xyz,.pcd,application/geo+json,.geojson"
        onChange={handleFileChange}
      />
      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #aaa',
          padding: '20px',
          marginTop: '10px',
          textAlign: 'center'
        }}
      >
        Drag and drop your file here
      </div>
      {fileInfo && (
        <div className="file-info">
          <p>Filename: {fileInfo.name}</p>
          <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>
          <p>Number of Points: {uploadProgress === 100 ? 'Processed' : 'Processing...'}</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
