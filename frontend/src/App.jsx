// App.jsx
import React, { useState } from 'react';
import Navbar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
    const [pointCloudData, setPointCloudData] = useState(null);
    const [pointCloudMeta, setPointCloudMeta] = useState(null);
  
    function handlePointCloudUpload(points, meta) {
      setPointCloudData(points);
      setPointCloudMeta(meta);
    }
  
    return (
      <div className="app-root">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onPointCloudUpload={handlePointCloudUpload}
        />
        <div className={sidebarOpen ? "main-content sidebar-open" : "main-content"}>
          <Dashboard
            pointCloudData={pointCloudData}
            pointCloudMeta={pointCloudMeta}
          />
        </div>
      </div>
    );
  }
  

export default App;
