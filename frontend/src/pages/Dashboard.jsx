// /**
//  * @file Dashboard.js
//  * @description Main dashboard page that composes Header, FileUpload, 3D/GIS viewers, and Logger.
//  */

// import React, { useState } from 'react';
// import Header from '../components/Header';
// //import FileUpload from '../components/FileUpload';
// import ThreeDViewer from '../components/ThreeDViewer';
// import GISViewer from '../components/GISViewer';
// import Logger from '../components/Logger';
// import '../styles/App.css';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('3d');
//   const [pointCloudData, setPointCloudData] = useState(null);
//   const [pointCloudMeta, setPointCloudMeta] = useState(null);

//   /**
//    * Callback to update state when a point cloud file is uploaded.
//    */
//   const handlePointCloudUpload = (points, meta) => {
//     console.log("Dashboard received point cloud with", points.length, "points.");
//     setPointCloudData(points);
//     setPointCloudMeta(meta);
//   };

//   return (
//     <div className="dashboard">
//       {/* ... other components like Header */}
//       <section className="center-panel">
//         {activeTab === '3d' ? (
//           <ThreeDViewer pointCloudData={pointCloudData} />
//         ) : (
//           // ... GISViewer component here
//           <div>GIS Viewer Placeholder</div>
//         )}
//       </section>
//       {/* ... Logger etc. */}
//     </div>
//   );
// };

// export default Dashboard;


// Dashboard.jsx
import React from 'react';
import ThreeDViewer from '../components/ThreeDViewer';
import GISViewer from '../components/GISViewer';

function Dashboard({ pointCloudData, pointCloudMeta }) {
  return (
    <div className="dashboard">
      <section className="center-panel">
        {/* We removed tab-navigation if not needed */}
        <ThreeDViewer pointCloudData={pointCloudData} />
      </section>
      {/* If you want to show metadata here, you can, but the sidebar already shows it */}
    </div>
  );
}

export default Dashboard;
