// src/App.js
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
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar for Desktop and Tablet */}
                <div className="hidden lg:block w-64 bg-gray-800 text-white">
                    <Sidebar />
                </div>

                {/* Mobile Navbar */}
                <div className="lg:hidden w-full">
                    <Navbar setIsMenuOpen={setIsMenuOpen} />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/browse" element={<Browse />} />
                    </Routes>
                </div>
               

                {/* Full-Width Menu for Mobile */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex flex-col">
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
                                className="text-white py-4 text-xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/browse"
                                className="text-white py-4 text-xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Browse
                            </Link>
                            {/* Add more navigation links here */}
                        </nav>
                    </div>
                )}

                {/* Main Content Area */}
               {/* <div className="flex-grow p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/browse" element={<Browse />} />
                    </Routes>
                </div>*/}
            </div>
        </Router>
    );
}

export default App;
