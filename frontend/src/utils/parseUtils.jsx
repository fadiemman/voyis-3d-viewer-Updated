// parseUtils.jsx
// A simple utility file exporting parsePCD and parseXYZ

/**
 * parsePCD
 * Handles ASCII or binary .pcd (x,y,z only).
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Object} { points, meta }
 */
export function parsePCD(arrayBuffer) {
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
  
    // Parse header lines
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
  
    if (dataFormat === 'ascii') {
      // ASCII mode
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
    } else if (dataFormat === 'binary') {
      // Binary mode
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
    } else if (dataFormat === 'binary_compressed') {
      throw new Error("binary_compressed not supported in this parser.");
    } else {
      throw new Error("Unknown PCD data format: " + dataFormat);
    }
  
    return { points, meta };
  }
  
  /**
   * parseXYZ
   * Expects text lines of x,y,z coordinates.
   * @param {string} text
   * @returns {Object} { points, meta }
   */
  export function parseXYZ(text) {
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
  