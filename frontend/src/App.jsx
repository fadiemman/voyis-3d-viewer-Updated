// App.jsx
import React, { useState } from 'react';
import Navbar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={sidebarOpen ? "main-content sidebar-open" : "main-content"}>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
