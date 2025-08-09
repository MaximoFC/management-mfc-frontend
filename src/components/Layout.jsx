import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </header>

      <aside className="hidden md:block fixed top-20 left-0 w-64 h-[calc(100vh-80px)] bg-white z-40 shadow-md">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed top-0 left-0 w-64 h-full bg-white shadow-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <button
              className="mt-4 p-2 bg-red-500 text-white rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <main className="md:ml-64 mt-20 p-4 sm:p-6 bg-gray-100 min-h-screen overflow-x-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
