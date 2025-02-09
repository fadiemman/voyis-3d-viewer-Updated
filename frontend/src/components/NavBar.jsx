// Navbar.jsx
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import logo from "../assets/voyis-logo.png";

/**
 * Minimal navbar that toggles the sidebar with setSidebarOpen
 */
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <nav className="relative z-50 flex justify-between items-center p-4 bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
            VOYIS 3D VIEWER
          </h1>
        </div>

        <img src={logo} alt="Logo" className="h-10" />

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>
    </>
  );
}
