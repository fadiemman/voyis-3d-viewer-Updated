// Sidebar.jsx
import React, { useState } from 'react';
import { X, Loader2 } from "lucide-react";
import { parsePCD, parseXYZ } from "../utils/parseUtils.jsx";

/**
 * @param {boolean} isOpen - Whether the sidebar is open.
 * @param {function} onClose - Function to close the sidebar.
 * @param {function} onPointCloudUpload - Callback when a .pcd or .xyz is parsed; signature: (points, meta).
 * @param {function} onGeoJsonUpload - Callback when a .geojson/.json is parsed; signature: (geoObject, fileInfo).
 * @param {function} onSwitchTab - (Optional) A callback to automatically switch to '3d' or 'gis' tab in the parent.
 */
function Sidebar({ isOpen, onClose, onPointCloudUpload, onGeoJsonUpload, onSwitchTab }) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  /**
   * Parses the selected file based on extension and simulates an upload progress bar.
   */
  const processFile = (file) => {
    if (!file) return;
    setIsLoading(true);
    setUploadProgress(0);

    // Basic file info (filename, size).
    setFileInfo({ name: file.name, size: file.size });

    // Determine the file extension
    const extension = file.name.split('.').pop().toLowerCase();

    // If you want automatic tab switching, do it right here
    if (onSwitchTab) {
      if (extension === 'pcd' || extension === 'xyz') {
        onSwitchTab('3d');     // Switch to 3D viewer
      } else if (extension === 'json' || extension === 'geojson') {
        onSwitchTab('gis');    // Switch to GIS map
      }
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result; // The file content
      let result = null;

      try {
        if (extension === 'pcd') {
          // .pcd => parse binary or ASCII point cloud
          result = parsePCD(content);
        } else if (extension === 'xyz') {
          // .xyz => parse as text with parseXYZ
          const textDecoder = new TextDecoder();
          const text = textDecoder.decode(content);
          result = parseXYZ(text);
        } else if (extension === 'geojson' || extension === 'json') {
          // .geojson / .json => parse as text-based JSON
          const geoObj = JSON.parse(content);
          result = geoObj; // We'll store it in 'result'
        } else {
          alert(`Unsupported file extension: .${extension}`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        setIsLoading(false);
        return;
      }

      // If it's a .pcd or .xyz, we might have result.points and result.meta
      // If it's .geojson / .json, result might be an object.

      // We'll store additional metadata for .pcd/xyz if available:
      let numPoints;
      let boundingBox;

      if (extension === 'pcd' || extension === 'xyz') {
        // parsePCD or parseXYZ returns { points, meta }
        if (result.meta) {
          numPoints = result.meta.numPoints;
          boundingBox = result.meta.boundingBox;
        }
      }

      // Update fileInfo with parse results:
      setFileInfo((prev) => ({
        ...prev,
        numPoints,
        boundingBox,
      }));

      // Simulate progress for the "upload"
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(simulateProgress);
          setUploadProgress(100);
          setIsLoading(false);

          // Once the "upload" is complete, call the appropriate callback
          if ((extension === 'pcd' || extension === 'xyz') && onPointCloudUpload) {
            // e.g. parsePCD => result = { points, meta }
            onPointCloudUpload(result.points, result.meta);
          } else if ((extension === 'geojson' || extension === 'json') && onGeoJsonUpload) {
            // e.g. .json => result is the geoObj
            onGeoJsonUpload(result, {
              name: file.name,
              size: file.size,
            });
          }
        }
      }, 200);
    };

    // If .pcd or .xyz => read as array buffer.
    // If .json/.geojson => read as text.
    if (extension === 'pcd' || extension === 'xyz') {
      reader.readAsArrayBuffer(file);
    } else if (extension === 'geojson' || extension === 'json') {
      reader.readAsText(file);
    } else {
      // You might handle other cases or fallback
      reader.readAsArrayBuffer(file);
    }
  };

  /**
   * Handler for the file <input> selection
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  if (!isOpen) return null; // If sidebar is closed, render nothing

  return (
    <div
      className="fixed left-0 top-0 w-64 h-full bg-gray-200 dark:bg-gray-800 p-4 shadow-lg z-40"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
      >
        <X size={24} />
      </button>

      {/* Upload UI */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-400 justify-center rounded-lg text-center">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pcd,.xyz,.geojson,.json"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <div className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              "Upload PCD/XYZ or JSON/GeoJSON"
            )}
          </div>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Accepted formats: .pcd, .xyz, .json, .geojson
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          (Drag & Drop also works)
        </p>
      </div>

      {/* Show progress bar & file info if file is set */}
      {fileInfo && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p>Filename: {fileInfo.name}</p>
          <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>
          {fileInfo.numPoints !== undefined && (
            <p>Points: {fileInfo.numPoints}</p>
          )}
          {fileInfo.boundingBox && (
            <div>
              <p>Bounding Box:</p>
              <p>X: [{fileInfo.boundingBox.minX.toFixed(2)}, {fileInfo.boundingBox.maxX.toFixed(2)}]</p>
              <p>Y: [{fileInfo.boundingBox.minY.toFixed(2)}, {fileInfo.boundingBox.maxY.toFixed(2)}]</p>
              <p>Z: [{fileInfo.boundingBox.minZ.toFixed(2)}, {fileInfo.boundingBox.maxZ.toFixed(2)}]</p>
            </div>
          )}
          <div
            className="progress-bar"
            style={{ background: '#ddd', borderRadius: '4px', marginTop: '5px' }}
          >
            <div
              className="progress"
              style={{
                width: `${uploadProgress}%`,
                background: 'green',
                color: 'white',
                textAlign: 'center',
                borderRadius: '4px',
              }}
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
