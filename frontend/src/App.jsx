// App.jsx
import React, { useState } from 'react';
import Navbar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pointCloudData, setPointCloudData] = useState(null);
    const [pointCloudMeta, setPointCloudMeta] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null); 
    const [activeTab, setActiveTab] = useState('3d');
  
    function handlePointCloudUpload(points, meta) {
      setPointCloudData(points);
      setPointCloudMeta(meta);
    }

    // If user uploads .pcd => setActiveTab('3d'), .json => 'gis'
    const handleSwitchTab = (tabName) => {
      setActiveTab(tabName);
    };

    function handleFileUpload(extension, data) {
      if (extension === 'pcd') {
        setActiveTab('3d');
        setPointCloudData(data.points);
      } else if (extension === 'json') {
        setActiveTab('gis');
        setGeoJsonData(data);
      }
    }

    function handleGeoJsonUpload(geoJsonObject, fileInfo) {
      // store in state
      setGeoJsonData(geoJsonObject);
    }
  
    return (
      <div className="app-root">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onPointCloudUpload={handlePointCloudUpload}
          onGeoJsonUpload={handleGeoJsonUpload}
          onFileUpload={handleFileUpload}
          onSwitchTab={handleSwitchTab}
        />
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
