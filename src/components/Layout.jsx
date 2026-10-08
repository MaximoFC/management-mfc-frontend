import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-black text-white flex-col sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full overflow-y-auto bg-black text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-col flex-1">

        {/* Navbar */}
        <header className="sticky top-0 z-30 h-16 md:h-20 bg-white border-b border-gray-200 flex items-center px-2 md:px-6">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </header>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {children}
        </main>

      </div>

    </div>
  );
};

export default Layout;