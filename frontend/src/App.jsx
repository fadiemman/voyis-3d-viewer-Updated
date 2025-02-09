// App.jsx
import React, { useState } from 'react';
import Navbar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 3D data & meta
  const [pointCloudData, setPointCloudData] = useState(null);
  const [pointCloudMeta, setPointCloudMeta] = useState(null);

  // 2D data
  const [geoJsonData, setGeoJsonData] = useState(null);

  // Which tab is active: '3d' or 'gis'
  const [activeTab, setActiveTab] = useState('3d');

  /**
   * Clears the 3D data => revert the 3D viewer to demo data.
   */
  const handleClearPointCloud = () => {
    setPointCloudData(null);
    setPointCloudMeta(null);
  };

  /**
   * Clears the 2D data => revert the GIS viewer to demo map.
   */
  const handleClearGeoJson = () => {
    setGeoJsonData(null);
  };

  /**
   * When the user uploads a .pcd or .xyz file, store the array of points in state, plus meta.
   */
  function handlePointCloudUpload(points, meta) {
    setPointCloudData(points);
    setPointCloudMeta(meta);
  }

  /**
   * When the user uploads a .json or .geojson file, store it in state.
   */
  function handleGeoJsonUpload(geoJsonObject, fileInfo) {
    setGeoJsonData(geoJsonObject);
  }

  /**
   * If user wants to automatically switch tab from the sidebar
   */
  function handleSwitchTab(tabName) {
    setActiveTab(tabName);
  }

  return (
    <div className="app-root">
      {/* Our left sidebar for uploading/canceling files */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}

        onPointCloudUpload={handlePointCloudUpload}
        onGeoJsonUpload={handleGeoJsonUpload}

        onSwitchTab={handleSwitchTab} // auto-switch tabs
        onClearPointCloud={handleClearPointCloud}
        onClearGeoJson={handleClearGeoJson}
      />

      {/* Our top navbar that toggles sidebar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* The main content area, showing 3D or GIS based on activeTab */}
      <div className={sidebarOpen ? "main-content sidebar-open" : "main-content"}>
        <Dashboard
          pointCloudData={pointCloudData}
          pointCloudMeta={pointCloudMeta}
          geoJsonData={geoJsonData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;
