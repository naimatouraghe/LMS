import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Browse from './pages/Browse';
import Dashboard from './Pages/Dashboard';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Profile from './pages/Profile';
import Course from './Pages/Course';
import { AuthProvider } from './contexts/AuthContext';

// Composant Layout pour gérer l'affichage conditionnel du Sidebar
const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isCoursePage = location.pathname.startsWith('/courses/');

    return (
        <div className="h-full">
            {/* Sidebar - Caché sur la page Course */}
            {!isCoursePage && (
                <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 bg-gray-900">
                    <Sidebar />
                </div>
            )}

            {/* Main Content */}
            <main className={`h-full ${!isCoursePage ? 'md:pl-72' : ''}`}>
                {/* Mobile Navbar */}
                <div className="md:hidden">
                    <Navbar setIsMenuOpen={setIsMenuOpen} />
                </div>

                {/* Content Area */}
                <div className={`${isCoursePage ? 'p-0' : 'p-6'}`}>
                    {children}
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && !isCoursePage && (
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
                            <Link
                                to="/profile"
                                className="text-white py-4 text-xl hover:text-gray-300 transition"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile
                            </Link>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/browse" element={<Browse />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/courses/:courseId" element={<Course />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;