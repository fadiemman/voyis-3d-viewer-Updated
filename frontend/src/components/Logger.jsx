/**
 * @file Logger.js
 * @description Component to display system logs and user activity.
 */

import React, { useState } from 'react';
import '../styles/Logger.css';

/**
 * Logger component renders a list of log messages.
 *
 * @returns {JSX.Element} The logger UI.
 */
const Logger = () => {
  // Example logs; in a real application, logs would be updated dynamically.
  const [logs, setLogs] = useState(['System initialized.']);

  return (
    <div className="logger">
      <h3>Activity Log</h3>
      <ul>
        {logs.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
};

export default Logger;
