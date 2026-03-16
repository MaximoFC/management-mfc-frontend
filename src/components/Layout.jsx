import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">

        {/* Navbar */}
        <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center">
          <Navbar />
        </header>

        {/* Main */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;
