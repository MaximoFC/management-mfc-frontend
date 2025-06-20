import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white">
                <Navbar />
            </header>

            <aside className="fixed top-24 left-0 w-64 h-[calc(100vh-80px)] bg-white z-40">
                <Sidebar />
            </aside>

            <main className="ml-64 mt-20 p-6 bg-gray-100 min-h-screen overflow-x-auto">
                {children}
            </main>
        </div>
    )
}

export default Layout;