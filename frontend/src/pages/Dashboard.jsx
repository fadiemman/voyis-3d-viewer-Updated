// // Dashboard.jsx
// import React from 'react';
// import ThreeDViewer from '../components/ThreeDViewer';
// import GISViewer from '../components/GISViewer';

// function Dashboard({ pointCloudData, pointCloudMeta, geoJsonData }) {
//   return (
//     <div className="dashboard">
//       <section className="center-panel">
//         {/* If you want to show both a 3D viewer and GIS map,
//             you might have tabs or a toggle. For example: */}
//         <ThreeDViewer pointCloudData={pointCloudData} />
//         {/* Also show the GIS Viewer for geoJsonData */}
//         <GISViewer geoJsonData={geoJsonData} />
//       </section>
//       {/* If you want to show metadata here, you can, but the sidebar already shows it */}
//     </div>
//   );
// }

// export default Dashboard;


import React, { useState } from 'react';
import ThreeDViewer from '../components/ThreeDViewer';
import GISViewer from '../components/GISViewer';

function Dashboard({ pointCloudData, geoJsonData }) {
  const [activeTab, setActiveTab] = useState('3d');

  // If user has only one data, you might auto-switch
  // but let's let them choose

  return (
    <div className="dashboard">
      <section className="center-panel">
        <button onClick={() => setActiveTab('3d')}>3D Viewer</button>
        <button onClick={() => setActiveTab('gis')}>GIS Map</button>

        {activeTab === '3d' ? (
          <ThreeDViewer pointCloudData={pointCloudData} />
        ) : (
          <GISViewer geoJsonData={geoJsonData} />
        )}
      </section>
    </div>
  );
}

export default Dashboard;
