// import {StrictMode} from 'react'
// import {createRoot} from 'react-dom/client'
// import './index.css'
// import App from './App.jsx';
// //import App from './App'
// import {ThemeProvider} from "./context/ThemeContext";
// import './styles/App.css'; // Ensure this is the correct path

// createRoot(document.getElementById('root')).render(
//     <App/>
// )


// main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Keep just one

import { ThemeProvider } from "./context/ThemeContext";
import './styles/App.css'; // Ensure this is the correct path

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
