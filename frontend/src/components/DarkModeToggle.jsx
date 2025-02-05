/**
 * @file DarkModeToggle.js
 * @description Provides a toggle switch to switch between dark and light mode.
 */

import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * DarkModeToggle component renders a checkbox that toggles dark mode.
 *
 * @returns {JSX.Element} The dark mode toggle component.
 */
const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="dark-mode-toggle">
      <label>
        Dark Mode
        <input
          type="checkbox"
          checked={darkMode}
          onChange={toggleTheme}
        />
      </label>
    </div>
  );
};

export default DarkModeToggle;
