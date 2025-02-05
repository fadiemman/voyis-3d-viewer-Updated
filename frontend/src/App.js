/**
 * @file App.js
 * @description Main App component that wraps the Dashboard with ThemeProvider.
 */

import React from 'react';
import Dashboard from './pages/Dashboard';
import { ThemeProvider } from './context/ThemeContext';

/**
 * App component wraps the Dashboard in a ThemeProvider to enable dark/light mode.
 *
 * @returns {JSX.Element} The root component of the application.
 */
function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
