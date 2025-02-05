/**
 * @file ThemeContext.js
 * @description Provides a React Context for managing dark/light mode.
 */

import React, { createContext, useState } from 'react';

// Create a Context for theme management.
export const ThemeContext = createContext();

/**
 * ThemeProvider component that wraps its children with theme context.
 *
 * @param {object} props - React props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} The provider component wrapping children with theme context.
 */
export const ThemeProvider = ({ children }) => {
  // State to manage dark mode (true for dark, false for light).
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Toggle the theme between dark and light.
   */
  const toggleTheme = () => setDarkMode(prevMode => !prevMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {/* Apply theme-specific class to a wrapping div */}
      <div className={darkMode ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
