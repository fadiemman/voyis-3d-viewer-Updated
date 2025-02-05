/**
 * @file Header.js
 * @description Top navigation bar that includes the Voyis logo, title, and menu.
 */

import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';
import '../styles/Header.css';

/**
 * Header component displays the top bar with the company logo, title, and a dropdown menu.
 *
 * @returns {JSX.Element} The header component.
 */
const Header = () => {
  const { darkMode } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Toggle the visibility of the dropdown menu.
   */
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="header">
      <div className="header-left">
        {/* Voyis Logo: Replace the src with the actual path to your logo */}
        <img src="/voyis-logo.png" alt="Voyis Logo" className="logo" />
        <h1>Voyis 3D Viewer</h1>
      </div>
      <div className="header-right">
        {/* Hamburger menu button */}
        <button className="menu-button" onClick={toggleMenu}>
          <span className="hamburger">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            {/* Dropdown menu items */}
            <DarkModeToggle />
            <a href="#help">Help</a>
            <a href="#about">About</a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
