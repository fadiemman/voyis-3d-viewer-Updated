/**
 * @file Dashboard.js
 * @description Main dashboard page that composes Header, FileUpload, 3D/GIS viewers, and Logger.
 */

import React, { useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ThreeDViewer from '../components/ThreeDViewer';
import GISViewer from '../components/GISViewer';
import Logger from '../components/Logger';
import '../styles/App.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('3d');
  const [pointCloudData, setPointCloudData] = useState(null);
  const [pointCloudMeta, setPointCloudMeta] = useState(null);

  /**
   * Callback to update state when a point cloud file is uploaded.
   */
  const handlePointCloudUpload = (points, meta) => {
    console.log("Dashboard received point cloud with", points.length, "points.");
    setPointCloudData(points);
    setPointCloudMeta(meta);
  };

  return (
    <div className="dashboard">
      {/* ... other components like Header */}
      <aside className="left-panel">
        <FileUpload onPointCloudUpload={handlePointCloudUpload} />
        {pointCloudMeta && (
          <div className="metadata">
            <p>Number of Points: {pointCloudMeta.numPoints}</p>
            <p>
              Bounding Box: X[{pointCloudMeta.boundingBox.minX.toFixed(2)} ,
              {pointCloudMeta.boundingBox.maxX.toFixed(2)}], Y[
              {pointCloudMeta.boundingBox.minY.toFixed(2)} ,
              {pointCloudMeta.boundingBox.maxY.toFixed(2)}], Z[
              {pointCloudMeta.boundingBox.minZ.toFixed(2)} ,
              {pointCloudMeta.boundingBox.maxZ.toFixed(2)}]
            </p>
          </div>
        )}
      </aside>
      <section className="center-panel">
        <div className="tab-navigation">
          <button onClick={() => setActiveTab('3d')}>3D Viewer</button>
          <button onClick={() => setActiveTab('gis')}>GIS Map</button>
        </div>
        {activeTab === '3d' ? (
          <ThreeDViewer pointCloudData={pointCloudData} />
        ) : (
          // ... GISViewer component here
          <div>GIS Viewer Placeholder</div>
        )}
      </section>
      {/* ... Logger etc. */}
    </div>
  );
};

export default Dashboard;
