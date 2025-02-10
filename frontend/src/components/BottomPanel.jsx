// BottomPanel.jsx
import React, { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";

function BottomPanel({ isOpen, onToggle, logs }) {
  const logRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever logs are updated
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
      <div
          className={`fixed bottom-0 left-0 w-full z-10 pb-5 ${
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
            <div
              ref={logRef}
              className="overflow-y-auto p-2 text-sm text-gray-700 dark:text-gray-300 h-full"
              style={{
                maxHeight: 'calc(100% - 40px)', // Ensures the height stays within the panel
              }}
            >
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