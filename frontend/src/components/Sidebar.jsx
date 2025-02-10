// Sidebar.jsx
import React, { useState } from 'react';
import {X, Loader2, Trash2} from "lucide-react";
import { parsePCD, parseXYZ } from "../utils/parseUtils.jsx";

/**
 * Sidebar handles uploading .pcd/.xyz/.json/.geojson,
 * auto-clears opposite data, auto-switches tab, etc.
 */
function Sidebar({
  isOpen,
  onClose,
  // Callbacks for final parse
  onPointCloudUpload,
  onGeoJsonUpload,

  // Optional: auto-switch tabs
  onSwitchTab,

  // Clearing old data (3D or GIS)
  onClearPointCloud,
  onClearGeoJson, 
  setLogs
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null); // Store file information
  const fileInputRef = React.useRef(null); // Reference to the file input element

  /**
   * Cancel button -> revert to demo data and reset input.
   */
  const handleCancelFile = () => {
    if (!fileInfo) return;

    // Clear fileInfo and reset progress
    setFileInfo(null);
    setUploadProgress(0);
    setIsLoading(false);

    // Revert viewer data to demo mode
    if (fileInfo.extension === 'pcd' || fileInfo.extension === 'xyz') {
      onClearPointCloud?.();
    } else if (fileInfo.extension === 'json' || fileInfo.extension === 'geojson') {
      onClearGeoJson?.();
    }

    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input value
    }
  };

  /**
   * Process a single uploaded file
   */
  const processFile = (file) => {
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();

    // Clear old data
    if (extension === 'pcd' || extension === 'xyz') {
      onClearGeoJson?.();
    } else if (extension === 'json' || extension === 'geojson') {
      onClearPointCloud?.();
    }

    // Auto-switch tabs based on file type
    if (onSwitchTab) {
      if (extension === 'pcd' || extension === 'xyz') {
        onSwitchTab('3d');
      } else if (extension === 'json' || extension === 'geojson') {
        onSwitchTab('gis');
      }
    }

    // Set loading state and file info
    setIsLoading(true);
    setUploadProgress(0);
    setFileInfo({
      name: file.name,
      size: file.size,
      extension
    });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      let result = null;

      try {
        if (extension === 'pcd') {
          result = parsePCD(content);
        } else if (extension === 'xyz') {
          const textDecoder = new TextDecoder();
          const text = textDecoder.decode(content);
          result = parseXYZ(text);
        } else if (extension === 'json' || extension === 'geojson') {
          const geoObj = JSON.parse(content);
          result = geoObj;
        } else {
          alert(`Unsupported extension: .${extension}`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        setIsLoading(false);
        return;
      }

      // Update file info with additional metadata
      let numPoints = undefined;
      let boundingBox = undefined;
      if ((extension === 'pcd' || extension === 'xyz') && result.meta) {
        numPoints = result.meta.numPoints;
        boundingBox = result.meta.boundingBox;
      }

      setFileInfo((prev) => ({
        ...prev,
        numPoints,
        boundingBox
      }));

      // Simulate upload progress
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(simulateProgress);
          setUploadProgress(100);
          setIsLoading(false);

          // Pass processed data to parent
          if ((extension === 'pcd' || extension === 'xyz') && onPointCloudUpload) {
            onPointCloudUpload(result.points, result.meta);
          } else if ((extension === 'json' || extension === 'geojson') && onGeoJsonUpload) {
            onGeoJsonUpload(result, {
              name: file.name,
              size: file.size
            });
          }
        }
      }, 200);
    };

    // Read file as ArrayBuffer or Text
    if (extension === 'pcd' || extension === 'xyz') {
      reader.readAsArrayBuffer(file);
    } else if (extension === 'json' || extension === 'geojson') {
      reader.readAsText(file);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-gray-200 dark:bg-gray-800 p-4 shadow-lg z-40">
      {/* Close button */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
      >
        <X size={24} />
      </button>

      {/* Upload UI */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-400 dark:text-white justify-center rounded-lg text-center">
        <label className="cursor-pointer">
          <input
            type="file"
            ref={fileInputRef} // Reference for resetting input
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
              "Upload/Drop Point Cloud (.pcd, .xyz) or JSON (.geojson, .json) File"
            )}
          </div>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Support Time-Series Animation
        </p>
      </div>

      {/* File Info and Progress */}
      {fileInfo && (
          <div className="mt-4 p-4 bg-gray-100 dark:text-white dark:bg-gray-700 rounded-lg">
            <div className="space-y-2">
              <p>File Name: {fileInfo.name}</p>
              <p>File Size: {Math.round(fileInfo.size / 1024)} KB</p>
              {/* If pcd/xyz => show points & bounding box */}
              {fileInfo.numPoints !== undefined && (
               <p>Number of Points: {fileInfo.numPoints}</p>
             )}
             {fileInfo.boundingBox && (
               <div>
                 <p>Bounding Box Dimension:</p>
                 <p>X: [{fileInfo.boundingBox.minX.toFixed(2)}, {fileInfo.boundingBox.maxX.toFixed(2)}]</p>
                 <p>Y: [{fileInfo.boundingBox.minY.toFixed(2)}, {fileInfo.boundingBox.maxY.toFixed(2)}]</p>
                 <p>Z: [{fileInfo.boundingBox.minZ.toFixed(2)}, {fileInfo.boundingBox.maxZ.toFixed(2)}]</p>
               </div>
             )}
            </div>

            <div className="flex justify-end mt-2">
              <button
                  onClick={handleCancelFile}
                  className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
      )}
    </div>
  );
}

export default Sidebar;

