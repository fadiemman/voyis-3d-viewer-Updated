// // BottomPanel.jsx
// import React from 'react';
// import '../styles/BottomPanel.css';

// function BottomPanel({ isOpen, onToggle, logs }) {
//   const panelHeight = isOpen ? '200px' : '0px';

//   return (
//     <div className="bottom-panel" style={{ height: panelHeight }}>
//       <div className="bottom-panel-header">
//         <button className="log-button" disabled>Log</button>
//         <button className="toggle-button" onClick={onToggle}>
//           {isOpen ? '↓' : '↑'}
//         </button>
//       </div>
//       <div className="bottom-panel-content">
//         {logs && logs.map((item, idx) => (
//           <div key={idx} className="log-entry">
//             {item}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default BottomPanel;


// BottomPanel.jsx
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";

function BottomPanel({ isOpen, onToggle, logs }) {
  return (
    <div
      className={`fixed bottom-0 left-0 w-full ${
        isOpen ? 'h-40' : 'h-10'
      } bg-gray-200 dark:bg-gray-800 transition-height duration-300 z-50`}
    >
      {/* Top bar with toggle button */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-300 dark:bg-gray-700">
        <span className="font-bold text-gray-700 dark:text-gray-300">Logs</span>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Logs content */}
      {isOpen && (
        <div className="overflow-y-auto p-2 text-sm text-gray-700 dark:text-gray-300">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <p key={index} className="mb-1">
                {log}
              </p>
            ))
          ) : (
            <p>No logs available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BottomPanel;
