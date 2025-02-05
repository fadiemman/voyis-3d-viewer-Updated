/**
 * @file index.js
 * @description Entry point for the React application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css'; // Global styles

// Create a root element and render the App component.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
