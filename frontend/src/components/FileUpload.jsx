// /**
//  * @file FileUpload.js
//  * @description Component to handle file uploads (click or drag-and-drop) and parse point cloud data.
//  */

// import React, { useState } from 'react';
// import '../styles/FileUpload.css';


// const processFile = (file) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   fetch('http://localhost:5000/upload', {
//     method: 'POST',
//     body: formData,
//   })
//     .then(response => response.json())
//     .then(data => console.log('Uploaded:', data))
//     .catch(error => console.error('Upload error:', error));
// };

// const FileUpload = ({ onPointCloudUpload }) => {
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [fileInfo, setFileInfo] = useState(null);

// /**
//  * parsePCD
//  * Attempts to parse a PCD file (v0.7) from an ArrayBuffer,
//  * detecting ascii vs binary for x, y, z fields only.
//  * 
//  * Returns an object: { points: [ [x,y,z], ... ], meta: {...} }
//  */
// function parsePCD(arrayBuffer) {
//   const textDecoder = new TextDecoder();
//   const fullText = textDecoder.decode(arrayBuffer);

//   const lines = fullText.split('\n');
//   let dataFormat = null;  // "ascii" or "binary" or "binary_compressed"
//   let numPoints = 0;
//   let fields = [];
//   let sizes = [];
//   let types = [];
//   let counts = [];
//   let meta = {
//     boundingBox: { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity },
//     numPoints: 0
//   };

//   let offsetInFile = 0;
//   let asciiStartLine = 0;

//   // 1) Read the header line-by-line
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
//     offsetInFile += line.length + 1; // approximate bytes for ASCII portion
//     if (line.startsWith('#')) continue; // comment

//     const tokens = line.split(/\s+/);
//     const key = tokens[0].toUpperCase();
//     switch (key) {
//       case 'FIELDS':
//         fields = tokens.slice(1); // e.g. ["x","y","z"]
//         break;
//       case 'SIZE':
//         sizes = tokens.slice(1).map(Number); // e.g. [4,4,4]
//         break;
//       case 'TYPE':
//         types = tokens.slice(1);            // e.g. ["F","F","F"]
//         break;
//       case 'COUNT':
//         counts = tokens.slice(1).map(Number); // e.g. [1,1,1]
//         break;
//       case 'POINTS':
//         numPoints = parseInt(tokens[1]);
//         meta.numPoints = numPoints;
//         break;
//       case 'DATA':
//         dataFormat = tokens[1].toLowerCase(); // ascii,binary,binary_compressed
//         asciiStartLine = i + 1;
//         break;
//       default:
//         break;
//     }
//     if (key === 'DATA') break; // stop reading header lines
//   }

//   if (!dataFormat) {
//     throw new Error("Invalid PCD: missing 'DATA' line in header.");
//   }

//   let points = [];

//   // 2) Branch: ascii vs binary
//   if (dataFormat === 'ascii') {
//     // The lines from asciiStartLine onward are numeric data
//     for (let i = asciiStartLine; i < lines.length; i++) {
//       const line = lines[i].trim();
//       if (!line) continue;
//       const parts = line.split(/\s+/).map(Number);
//       if (parts.length >= 3) {
//         const [x, y, z] = parts;
//         points.push([x, y, z]);
//         if (x < meta.boundingBox.minX) meta.boundingBox.minX = x;
//         if (y < meta.boundingBox.minY) meta.boundingBox.minY = y;
//         if (z < meta.boundingBox.minZ) meta.boundingBox.minZ = z;
//         if (x > meta.boundingBox.maxX) meta.boundingBox.maxX = x;
//         if (y > meta.boundingBox.maxY) meta.boundingBox.maxY = y;
//         if (z > meta.boundingBox.maxZ) meta.boundingBox.maxZ = z;
//       }
//     }
//   } 
//   else if (dataFormat === 'binary') {
//     // We'll parse the rest of the ArrayBuffer as floats (assuming x,y,z float32).
//     // offsetInFile is an approximate ASCII header length, so the binary data starts there.
//     const dataView = new DataView(arrayBuffer);
//     // Compute stride from the fields
//     let stride = 0;
//     for (let i = 0; i < fields.length; i++) {
//       stride += sizes[i] * counts[i]; // e.g. 4 * 1 for each field
//     }
//     // e.g. if fields=[x,y,z], sizes=[4,4,4], counts=[1,1,1], stride=12
//     if (stride === 0) {
//       throw new Error("Invalid stride: check SIZE or COUNT in header.");
//     }
//     // For each point, read x,y,z as float32 in little-endian
//     for (let i = 0; i < numPoints; i++) {
//       const pointOffset = offsetInFile + i * stride;
//       const x = dataView.getFloat32(pointOffset, true);
//       const y = dataView.getFloat32(pointOffset + 4, true);
//       const z = dataView.getFloat32(pointOffset + 8, true);
//       points.push([x, y, z]);
//       if (x < meta.boundingBox.minX) meta.boundingBox.minX = x;
//       if (y < meta.boundingBox.minY) meta.boundingBox.minY = y;
//       if (z < meta.boundingBox.minZ) meta.boundingBox.minZ = z;
//       if (x > meta.boundingBox.maxX) meta.boundingBox.maxX = x;
//       if (y > meta.boundingBox.maxY) meta.boundingBox.maxY = y;
//       if (z > meta.boundingBox.maxZ) meta.boundingBox.maxZ = z;
//     }
//   }
//   else if (dataFormat === 'binary_compressed') {
//     throw new Error("This parser does not support 'binary_compressed' data. Please uncompress first.");
//   }
//   else {
//     throw new Error("Unknown data format: " + dataFormat);
//   }

//   meta.boundingBox = {
//     minX: meta.boundingBox.minX, minY: meta.boundingBox.minY, minZ: meta.boundingBox.minZ,
//     maxX: meta.boundingBox.maxX, maxY: meta.boundingBox.maxY, maxZ: meta.boundingBox.maxZ
//   };
//   return { points, meta };
// }

//   /**
//    * Parse a .xyz file content.
//    * @param {string} content - The file text.
//    * @returns {object} An object with an array of points and metadata.
//    */
//   const parseXYZ = (content) => {
//     const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
//     let points = [];
//     const meta = {
//       numPoints: 0,
//       boundingBox: { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity }
//     };
//     for (let line of lines) {
//       const parts = line.split(/\s+/);
//       if (parts.length >= 3) {
//         const x = parseFloat(parts[0]);
//         const y = parseFloat(parts[1]);
//         const z = parseFloat(parts[2]);
//         points.push([x, y, z]);
//         meta.boundingBox.minX = Math.min(meta.boundingBox.minX, x);
//         meta.boundingBox.minY = Math.min(meta.boundingBox.minY, y);
//         meta.boundingBox.minZ = Math.min(meta.boundingBox.minZ, z);
//         meta.boundingBox.maxX = Math.max(meta.boundingBox.maxX, x);
//         meta.boundingBox.maxY = Math.max(meta.boundingBox.maxY, y);
//         meta.boundingBox.maxZ = Math.max(meta.boundingBox.maxZ, z);
//       }
//     }
//     meta.numPoints = points.length;
//     console.log("Parsed XYZ: ", meta.numPoints, "points.", meta);
//     return { points, meta };
//   };

//   /**
//    * Process the uploaded file: read its content, parse it, and simulate upload progress.
//    * @param {File} file - The uploaded file.
//    */
//   const processFile = (file) => {
//     setFileInfo({
//       name: file.name,
//       size: file.size,
//     });
//     console.log("Processing file:", file.name);
//     const extension = file.name.split('.').pop().toLowerCase();
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const buffer = event.target.result; // This is an ArrayBuffer
//       let result;
//       if (extension === 'pcd') {
//         // parsePCD now handles both ASCII and binary from the ArrayBuffer
//         try {
//           result = parsePCD(buffer);
//         } catch (err) {
//           console.error("Error parsing PCD:", err);
//           return;
//         }
//       } else if (extension === 'xyz') {
//         // still read as text: we can decode buffer -> text
//         const textDecoder = new TextDecoder();
//         const text = textDecoder.decode(buffer);
//         result = parseXYZ(text);
//       } else {
//         console.error("Unsupported file extension:", extension);
//         return;
//       }

//       // Simulate upload progress...
//       let progress = 0;
//       const simulateProgress = setInterval(() => {
//         progress += 10;
//         setUploadProgress(progress);
//         if (progress >= 100) {
//           clearInterval(simulateProgress);
//           setUploadProgress(100);
//           console.log("File processed, invoking callback with", result.points.length, "points.");
//           if (onPointCloudUpload) {
//             onPointCloudUpload(result.points, result.meta);
//           }
//         }
//       }, 100);
//     };

//     // For .pcd or .xyz, read as ArrayBuffer
//     reader.readAsArrayBuffer(file);
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       processFile(file);
//     }
//   };

//   const handleDragOver = (event) => {
//     event.preventDefault();
//   };

//   const handleDrop = (event) => {
//     event.preventDefault();
//     if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
//       const file = event.dataTransfer.files[0];
//       processFile(file);
//       event.dataTransfer.clearData();
//     }
//   };

//   return (
//     <div className="file-upload">
//       <h2>Upload Files</h2>
//       <input
//         type="file"
//         accept=".xyz,.pcd,application/geo+json,.geojson"
//         onChange={handleFileChange}
//       />
//       <div
//         className="drop-zone"
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//         style={{
//           border: '2px dashed #aaa',
//           padding: '20px',
//           marginTop: '10px',
//           textAlign: 'center'
//         }}
//       >
//         Drag and drop your file here
//       </div>
//       {fileInfo && (
//         <div className="file-info">
//           <p>Filename: {fileInfo.name}</p>
//           <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>       
//           <div className="progress-bar">
//             <div className="progress" style={{ width: `${uploadProgress}%` }}>
//               {uploadProgress}%
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FileUpload;

/**
 * FileUpload.js
 * Allows users to upload .pcd (ascii or binary) or .xyz files,
 * parse them in the browser, and pass the parsed data up via onPointCloudUpload.
 */

import React, { useState } from 'react';
import '../styles/FileUpload.css';

/**
 * parsePCD - handles ascii or binary .pcd (x,y,z only).
 */
function parsePCD(arrayBuffer) {
  const textDecoder = new TextDecoder();
  const fullText = textDecoder.decode(arrayBuffer);

  const lines = fullText.split('\n');
  let dataFormat = null;
  let numPoints = 0;
  let fields = [];
  let sizes = [];
  let types = [];
  let counts = [];
  let meta = {
    boundingBox: {
      minX: Infinity, minY: Infinity, minZ: Infinity,
      maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity
    },
    numPoints: 0
  };

  let offsetInFile = 0;
  let asciiStartLine = 0;

  // Parse header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    offsetInFile += line.length + 1; // approximate ASCII portion
    if (line.startsWith('#')) continue; // skip comments

    const tokens = line.split(/\s+/);
    const key = tokens[0].toUpperCase();
    switch (key) {
      case 'FIELDS':
        fields = tokens.slice(1);
        break;
      case 'SIZE':
        sizes = tokens.slice(1).map(Number);
        break;
      case 'TYPE':
        types = tokens.slice(1);
        break;
      case 'COUNT':
        counts = tokens.slice(1).map(Number);
        break;
      case 'POINTS':
        numPoints = parseInt(tokens[1]);
        meta.numPoints = numPoints;
        break;
      case 'DATA':
        dataFormat = tokens[1].toLowerCase();
        asciiStartLine = i + 1;
        break;
      default:
        break;
    }
    if (key === 'DATA') break;
  }

  if (!dataFormat) {
    throw new Error("Invalid PCD: missing DATA line.");
  }

  const points = [];

  // ASCII mode
  if (dataFormat === 'ascii') {
    for (let i = asciiStartLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\s+/).map(Number);
      if (parts.length >= 3) {
        const [x, y, z] = parts;
        points.push([x, y, z]);
        // Update bounding box
        meta.boundingBox.minX = Math.min(meta.boundingBox.minX, x);
        meta.boundingBox.minY = Math.min(meta.boundingBox.minY, y);
        meta.boundingBox.minZ = Math.min(meta.boundingBox.minZ, z);
        meta.boundingBox.maxX = Math.max(meta.boundingBox.maxX, x);
        meta.boundingBox.maxY = Math.max(meta.boundingBox.maxY, y);
        meta.boundingBox.maxZ = Math.max(meta.boundingBox.maxZ, z);
      }
    }
  }
  // Binary mode
  else if (dataFormat === 'binary') {
    const dataView = new DataView(arrayBuffer);
    // Compute stride
    let stride = 0;
    for (let i = 0; i < fields.length; i++) {
      stride += sizes[i] * counts[i];
    }
    if (stride === 0) {
      throw new Error("Invalid stride from header.");
    }
    for (let i = 0; i < numPoints; i++) {
      const offset = offsetInFile + i * stride;
      const x = dataView.getFloat32(offset + 0, true);
      const y = dataView.getFloat32(offset + 4, true);
      const z = dataView.getFloat32(offset + 8, true);
      points.push([x, y, z]);
      meta.boundingBox.minX = Math.min(meta.boundingBox.minX, x);
      meta.boundingBox.minY = Math.min(meta.boundingBox.minY, y);
      meta.boundingBox.minZ = Math.min(meta.boundingBox.minZ, z);
      meta.boundingBox.maxX = Math.max(meta.boundingBox.maxX, x);
      meta.boundingBox.maxY = Math.max(meta.boundingBox.maxY, y);
      meta.boundingBox.maxZ = Math.max(meta.boundingBox.maxZ, z);
    }
  }
  else if (dataFormat === 'binary_compressed') {
    throw new Error("binary_compressed not supported in this demo parser.");
  }
  else {
    throw new Error("Unknown PCD data format: " + dataFormat);
  }

  return { points, meta };
}

/**
 * parseXYZ - your existing .xyz parser that expects text lines.
 */
function parseXYZ(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const points = [];
  const meta = {
    numPoints: 0,
    boundingBox: {
      minX: Infinity, minY: Infinity, minZ: Infinity,
      maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity
    }
  };
  for (let line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      points.push([x, y, z]);
      meta.boundingBox.minX = Math.min(meta.boundingBox.minX, x);
      meta.boundingBox.minY = Math.min(meta.boundingBox.minY, y);
      meta.boundingBox.minZ = Math.min(meta.boundingBox.minZ, z);
      meta.boundingBox.maxX = Math.max(meta.boundingBox.maxX, x);
      meta.boundingBox.maxY = Math.max(meta.boundingBox.maxY, y);
      meta.boundingBox.maxZ = Math.max(meta.boundingBox.maxZ, z);
    }
  }
  meta.numPoints = points.length;
  return { points, meta };
}

const FileUpload = ({ onPointCloudUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  const processFile = (file) => {
    setFileInfo({ name: file.name, size: file.size });
    console.log("Processing file:", file.name);

    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
      const buffer = event.target.result; // ArrayBuffer

      let result = null;
      if (extension === 'pcd') {
        try {
          result = parsePCD(buffer); // handles ASCII or binary
        } catch (err) {
          console.error("Error parsing PCD:", err);
          return;
        }
      } else if (extension === 'xyz') {
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(buffer);
        result = parseXYZ(text);
      } else {
        console.error("Unsupported file extension:", extension);
        return;
      }

      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(simulateProgress);
          setUploadProgress(100);
          console.log(
            "File processed, invoking callback with",
            result.points.length,
            "points."
          );
          if (onPointCloudUpload) {
            onPointCloudUpload(result.points, result.meta);
          }
        }
      }, 100);
    };

    // Use readAsArrayBuffer instead of readAsText
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event) => event.preventDefault();
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
          textAlign: 'center',
        }}
      >
        Drag and drop your file here
      </div>
      {fileInfo && (
        <div className="file-info">
          <p>Filename: {fileInfo.name}</p>
          <p>Size: {Math.round(fileInfo.size / 1024)} KB</p>
          {/* Additional UI to show uploadProgress */}
          <div className="progress-bar" style={{ background: '#ddd', borderRadius: '4px', marginTop: '5px' }}>
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
};

export default FileUpload;
