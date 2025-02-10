import React from 'react';
import ThreeDViewer from '../components/ThreeDViewer';
import GISViewer from '../components/GISViewer';
import '../styles/App.css'; // for styling .viewer-tab-switch, etc.

function Dashboard({ activeTab, setActiveTab, pointCloudData, geoJsonData, setLogs, bottomPanelOpen }) { 
  return (
    <div className={`dashboard ${bottomPanelOpen ? 'bottom-panel-open' : ''}`}>
      <section className="center-panel" style={{ height: `calc(100vh - ${bottomPanelOpen ? '270px' : '10px'})` }}>
        {/* Show 3D or GIS based on activeTab */}
        {activeTab === '3d' ? (
          <ThreeDViewer pointCloudData={pointCloudData} setLogs={setLogs} />
        ) : (
          <GISViewer geoJsonData={geoJsonData} setLogs={setLogs} bottomPanelOpen={bottomPanelOpen} />
        )}

        {/* Viewer tab switch */}
        <div className="viewer-tab-switch">
          <span
            className={activeTab === '3d' ? 'tab-selected' : ''}
            onClick={() => setActiveTab('3d')}
          >
            3D Viewer
          </span>
          <span
            className={activeTab === 'gis' ? 'tab-selected' : ''}
            onClick={() => setActiveTab('gis')}
          >
            GIS Map
          </span>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

