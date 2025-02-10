// // Sidebar.jsx
// import React, { useState } from 'react';
// import { X, Loader2 } from "lucide-react";
// import { parsePCD, parseXYZ } from "../utils/parseUtils.jsx";

// /**
//  * Sidebar handles uploading .pcd/.xyz/.json/.geojson,
//  * auto-clears opposite data, auto-switches tab, etc.
//  */
// function Sidebar({
//   isOpen,
//   onClose,
//   // Callbacks for final parse
//   onPointCloudUpload,
//   onGeoJsonUpload,

//   // Optional: auto-switch tabs
//   onSwitchTab,

//   // Clearing old data (3D or GIS)
//   onClearPointCloud,
//   onClearGeoJson
// }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   /**
//    * fileInfo = {
//    *   name, size, extension,
//    *   numPoints, boundingBox
//    * }
//    */
//   const [fileInfo, setFileInfo] = useState(null);
//   const fileInputRef = React.useRef(null); // Reference to the input element

//   /**
//    * Cancel button -> revert to demo data
//    */
//   const handleCancelFile = () => {
//     if (!fileInfo) return;
//     setFileInfo(null);
//     setUploadProgress(0);
//     setIsLoading(false);

//     // Revert viewer data to demo mode
//     if (fileInfo.extension === 'pcd' || fileInfo.extension === 'xyz') {
//       onClearPointCloud?.();
//       setLogs((prevLogs) => [...prevLogs, "Switched to 3D Viewer demo data."]);
//     } else if (fileInfo.extension === 'json' || fileInfo.extension === 'geojson') {
//       onClearGeoJson?.();
//       setLogs((prevLogs) => [...prevLogs, "Switched to GIS Map demo data."]);
//     }
//   };

//   /**
//    * Parse logic for a single file
//    */
//   const processFile = (file) => {
//     if (!file) return;

//     const extension = file.name.split('.').pop().toLowerCase();

//     // Clear old data first
//     if (extension === 'pcd' || extension === 'xyz') {
//       onClearGeoJson?.();
//     } else if (extension === 'json' || extension === 'geojson') {
//       onClearPointCloud?.();
//     }

//     // Auto-switch tabs if desired
//     if (onSwitchTab) {
//       if (extension === 'pcd' || extension === 'xyz') {
//         onSwitchTab('3d');
//       } else if (extension === 'json' || extension === 'geojson') {
//         onSwitchTab('gis');
//       }
//     }

//     // Begin reading
//     setIsLoading(true);
//     setUploadProgress(0);
//     setFileInfo({
//       name: file.name,
//       size: file.size,
//       extension
//     });

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const content = evt.target.result;
//       let result = null;

//       try {
//         if (extension === 'pcd') {
//           result = parsePCD(content);
//         } else if (extension === 'xyz') {
//           const textDecoder = new TextDecoder();
//           const text = textDecoder.decode(content);
//           result = parseXYZ(text);
//         } else if (extension === 'json' || extension === 'geojson') {
//           const geoObj = JSON.parse(content);
//           result = geoObj;
//         } else {
//           alert(`Unsupported extension: .${extension}`);
//           setIsLoading(false);
//           return;
//         }
//       } catch (error) {
//         console.error("Error parsing file:", error);
//         setIsLoading(false);
//         return;
//       }

//       // If pcd/xyz => we might have result.points, result.meta
//       let numPoints = undefined;
//       let boundingBox = undefined;
//       if ((extension === 'pcd' || extension === 'xyz') && result.meta) {
//         numPoints = result.meta.numPoints;
//         boundingBox = result.meta.boundingBox;
//       }

//       // Update local file info
//       setFileInfo((prev) => ({
//         ...prev,
//         numPoints,
//         boundingBox
//       }));

//       // Simulate progress
//       let progress = 0;
//       const simulateProgress = setInterval(() => {
//         progress += 20;
//         setUploadProgress(progress);

//         if (progress >= 100) {
//           clearInterval(simulateProgress);
//           setUploadProgress(100);
//           setIsLoading(false);

//           // Pass data up
//           if ((extension === 'pcd' || extension === 'xyz') && onPointCloudUpload) {
//             // result = { points, meta }
//             onPointCloudUpload(result.points, result.meta);
//             setLogs((prevLogs) => [
//               ...prevLogs,
//               `Uploaded PCD file: ${file.name} (${Math.round(file.size / 1024)} KB) with ${result.meta.numPoints} points.`
//             ]);
//           } else if ((extension === 'json' || extension === 'geojson') && onGeoJsonUpload) {
//             onGeoJsonUpload(result, {
//               name: file.name,
//               size: file.size
//             });
//             setLogs((prevLogs) => [
//               ...prevLogs,
//               `Uploaded GeoJSON file: ${file.name} (${Math.round(file.size / 1024)} KB).`
//             ]);
//           }
//         }
//       }, 200);
//     };

//     // read the file as array buffer or text
//     if (extension === 'pcd' || extension === 'xyz') {
//       reader.readAsArrayBuffer(file);
//     } else if (extension === 'json' || extension === 'geojson') {
//       reader.readAsText(file);
//     } else {
//       // fallback
//       reader.readAsArrayBuffer(file);
//     }
//   };

//   /**
//    * Handler for <input>
//    */
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) processFile(file);
//     console.log(e)
//   };

//   /**
//    * Drag & drop
//    */
//   const handleDragOver = (e) => e.preventDefault();
//   const handleDrop = (e) => {
//     e.preventDefault();
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       processFile(e.dataTransfer.files[0]);
//       e.dataTransfer.clearData();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed left-0 top-0 w-64 h-full bg-gray-200 dark:bg-gray-800 p-4 shadow-lg z-40"
//       onDragOver={handleDragOver}
//       onDrop={handleDrop}
//     >
//       {/* Close button */}
//       <button
//         onClick={onClose}
//         className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
//       >
//         <X size={24} />
//       </button>

//       {/* Upload UI */}
//       <div className="mt-6 p-4 border-2 border-dashed border-gray-400 justify-center rounded-lg text-center">
//         <label className="cursor-pointer">
//           <input
//             type="file"
//             accept=".pcd,.xyz,.geojson,.json"
//             className="hidden"
//             onChange={handleFileChange}
//             disabled={isLoading}
//           />
//           <div className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2">
//             {isLoading ? (
//               <>
//                 <Loader2 className="animate-spin" size={16} />
//                 Processing...
//               </>
//             ) : (
//               "Upload PCD/XYZ or JSON/GeoJSON"
//             )}
//           </div>
//         </label>
//         <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
//           Accepted: .pcd, .xyz, .json, .geojson
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
//           (Drag & Drop works)
//         </p>
//       </div>

//       {/* File info */}
//       {fileInfo && (
//         <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
//           <p>Filename: {fileInfo.name}</p>
//           <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>

//           {/* Cancel button */}
//           <span
//             style={{ cursor: 'pointer', color: 'red' }}
//             onClick={handleCancelFile}
//           >
//             [Cancel File]
//           </span>

//           {/* If pcd/xyz => show points & bounding box */}
//           {fileInfo.numPoints !== undefined && (
//             <p>Points: {fileInfo.numPoints}</p>
//           )}
//           {fileInfo.boundingBox && (
//             <div>
//               <p>Bounding Box:</p>
//               <p>X: [{fileInfo.boundingBox.minX.toFixed(2)}, {fileInfo.boundingBox.maxX.toFixed(2)}]</p>
//               <p>Y: [{fileInfo.boundingBox.minY.toFixed(2)}, {fileInfo.boundingBox.maxY.toFixed(2)}]</p>
//               <p>Z: [{fileInfo.boundingBox.minZ.toFixed(2)}, {fileInfo.boundingBox.maxZ.toFixed(2)}]</p>
//             </div>
//           )}

//           {/* Progress Bar */}
//           <div
//             className="progress-bar"
//             style={{ background: '#ddd', borderRadius: '4px', marginTop: '5px' }}
//           >
//             <div
//               className="progress"
//               style={{
//                 width: `${uploadProgress}%`,
//                 background: 'green',
//                 color: 'white',
//                 textAlign: 'center',
//                 borderRadius: '4px',
//               }}
//             >
//               {uploadProgress}%
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Sidebar;


// Sidebar.jsx
import React, { useState } from 'react';
import { X, Loader2 } from "lucide-react";
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
  onClearGeoJson
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

      {/* Upload Section */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-400 justify-center rounded-lg text-center">
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
              "Upload PCD/XYZ or JSON/GeoJSON"
            )}
          </div>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Accepted: .pcd, .xyz, .json, .geojson
        </p>
      </div>

      {/* File Info and Progress */}
      {fileInfo && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p>Filename: {fileInfo.name}</p>
          <p>File Size: {Math.round(fileInfo.size / 1024)} KB</p>
          {fileInfo.numPoints !== undefined && <p>Points: {fileInfo.numPoints}</p>}
          {fileInfo.boundingBox && (
            <div>
              <p>Bounding Box:</p>
              <p>X: [{fileInfo.boundingBox.minX.toFixed(2)}, {fileInfo.boundingBox.maxX.toFixed(2)}]</p>
              <p>Y: [{fileInfo.boundingBox.minY.toFixed(2)}, {fileInfo.boundingBox.maxY.toFixed(2)}]</p>
              <p>Z: [{fileInfo.boundingBox.minZ.toFixed(2)}, {fileInfo.boundingBox.maxZ.toFixed(2)}]</p>
            </div>
          )}
          <div className="progress-bar" style={{ background: '#ddd', borderRadius: '4px', marginTop: '5px' }}>
            <div
              className="progress"
              style={{
                width: `${uploadProgress}%`,
                background: 'green',
                color: 'white',
                textAlign: 'center',
                borderRadius: '4px'
              }}
            >
              {uploadProgress}%
            </div>
          </div>
          <span
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={handleCancelFile}
          >
            [Cancel File]
          </span>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

