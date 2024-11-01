// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ setIsMenuOpen }) => {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl">LMS App</h1>
            <div className="hidden lg:flex space-x-4">
                <Link to="/" className="hover:text-gray-300">Dashboard</Link>
                <Link to="/browse" className="hover:text-gray-300">Browse</Link>
                {/* Add more navigation links here */}
            </div>
            <div className="lg:hidden">
                <button onClick={() => setIsMenuOpen(true)} className="focus:outline-none">
                    ☰
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
