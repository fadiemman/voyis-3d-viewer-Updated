// App.jsx
import React, { useState } from 'react';
import Navbar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import BottomPanel from "./components/BottomPanel";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 3D data & meta
  const [pointCloudData, setPointCloudData] = useState(null);
  const [pointCloudMeta, setPointCloudMeta] = useState(null);

  // 2D data
  const [geoJsonData, setGeoJsonData] = useState(null);

  // Bottom Panel
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  // Which tab is active: '3d' or 'gis'
  const [activeTab, setActiveTab] = useState('3d');
  // Add state for altitude range
  const [altitudeRange, setAltitudeRange] = useState([-Infinity, Infinity]);

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
    setLogs((prevLogs) => [
      ...prevLogs,
      `Uploaded PCD file`
    ]);
  }

  /**
   * When the user uploads a .json or .geojson file, store it in state.
   */
  function handleGeoJsonUpload(geoJsonObject, fileInfo) {
    setGeoJsonData(geoJsonObject);
    setLogs((prevLogs) => [
      ...prevLogs,
      `Uploaded GeoJSON file: ${fileInfo.name} (${Math.round(fileInfo.size / 1024)} KB).`
    ]);
  }

  /**
   * If user wants to automatically switch tab from the sidebar
   */
  function handleSwitchTab(tabName) {
    setActiveTab(tabName);

    // Log the tab switch
    setLogs((prevLogs) => [
      ...prevLogs,
      tabName === '3d' ? "Switched to 3D Viewer." : "Switched to GIS Map."
    ]);
  }

  return (
    <div className="app-root">
      {/* Our left sidebar for uploading/canceling files */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        setLogs={setLogs}
        onPointCloudUpload={handlePointCloudUpload}
        onGeoJsonUpload={handleGeoJsonUpload}

        onSwitchTab={handleSwitchTab} // auto-switch tabs
        onClearPointCloud={handleClearPointCloud}
        onClearGeoJson={handleClearGeoJson}

        altitudeRange={altitudeRange} // Pass altitude range
        setAltitudeRange={setAltitudeRange} // Pass setter for altitude range
      />

      {/* Our top navbar that toggles sidebar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* The main content area, showing 3D or GIS based on activeTab */}
      <div
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : ""
        } ${bottomPanelOpen ? "bottom-panel-open" : ""}`}
      >
        <Dashboard
          pointCloudData={pointCloudData}
          pointCloudMeta={pointCloudMeta}
          geoJsonData={geoJsonData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setLogs={setLogs}
          bottomPanelOpen={bottomPanelOpen} // Pass bottomPanel state
          altitudeRange={altitudeRange} // Pass altitude range to Dashboard
        />
      </div>
      <BottomPanel
        isOpen={bottomPanelOpen}
        onToggle={() => {
          setBottomPanelOpen(!bottomPanelOpen);
          setLogs((prevLogs) => [
            ...prevLogs,
            bottomPanelOpen ? "Closed logs panel." : "Opened logs panel." // Log the toggle action
          ]);
        }}
        logs={logs}
      />
    </div>
  );
}

export default App;