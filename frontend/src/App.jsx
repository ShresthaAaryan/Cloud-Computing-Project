import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
