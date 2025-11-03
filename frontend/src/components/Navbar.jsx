import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span>Multi-Cloud Cost</span>
        </Link>
        <div className="flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600 dark:text-neutral-300"}>Home</NavLink>
          <NavLink to="/calculator" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600 dark:text-neutral-300"}>Calculator</NavLink>
          <NavLink to="/methodology" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600 dark:text-neutral-300"}>Methodology</NavLink>
          <NavLink to="/research" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600 dark:text-neutral-300"}>Research</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600 dark:text-neutral-300"}>About</NavLink>
        </div>
      </nav>
    </header>
  );
}


