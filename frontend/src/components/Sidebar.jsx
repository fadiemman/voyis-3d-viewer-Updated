// Sidebar.jsx
import React, { useState } from 'react';
import { X, Loader2 } from "lucide-react";
import { parsePCD, parseXYZ } from "../utils/parseUtils.jsx";

function Sidebar({ isOpen, onClose, onPointCloudUpload }) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    setIsLoading(true);
    setUploadProgress(0);
    setFileInfo({ name: file.name, size: file.size });

    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      const buffer = evt.target.result;
      let result = null;

      try {
        if (extension === 'pcd') {
          result = parsePCD(buffer);
        } else if (extension === 'xyz') {
          const textDecoder = new TextDecoder();
          const text = textDecoder.decode(buffer);
          result = parseXYZ(text);
        } else {
          // If you also want to handle .json or .gls, do so here
          alert(`Unsupported file extension: .${extension}`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        setIsLoading(false);
        return;
      }

      // Simulate a progress bar
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(simulateProgress);
          setUploadProgress(100);
          setIsLoading(false);

          // If you want to pass data to the 3D viewer:
          if (onPointCloudUpload) {
            onPointCloudUpload(result.points, result.meta);
          }
        }
      }, 200);
    };

    // Read as array buffer so we can handle binary or ascii
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  // For drag & drop
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  if (!isOpen) return null; // If sidebar is not open, render nothing

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
            accept=".pcd,.xyz"
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
              "Upload PCD or XYZ File"
            )}
          </div>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Accepted formats: .pcd, .xyz
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          (Drag & Drop in this sidebar also works)
        </p>
      </div>

      {/* Show progress bar & file info if file is set */}
      {fileInfo && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p>Filename: {fileInfo.name}</p>
          <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>
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
