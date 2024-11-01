import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Browse from './pages/Browse';
import Dashboard from './pages/Dashboard';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Router>
            <div className="h-full">
                {/* Sidebar - Fixed on desktop, hidden on mobile */}
                <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 bg-gray-900">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <main className="md:pl-72 h-full">
                    {/* Mobile Navbar */}
                    <div className="md:hidden">
                        <Navbar setIsMenuOpen={setIsMenuOpen} />
                    </div>

                    {/* Content Area - Shown on all devices */}
                    <div className="p-6">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/browse" element={<Browse />} />
                        </Routes>
                    </div>
                </main>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 md:hidden">
                        <div className="flex h-full flex-col">
                            <div className="flex justify-end p-4">
                                <button
                                    className="text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <nav className="flex-grow flex flex-col items-center justify-center">
                                <Link
                                    to="/"
                                    className="text-white py-4 text-xl hover:text-gray-300 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/browse"
                                    className="text-white py-4 text-xl hover:text-gray-300 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Browse
                                </Link>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App;