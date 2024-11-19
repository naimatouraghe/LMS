import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ setIsMenuOpen }) => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center justify-center">
        {' '}
        {/* Ajout de justify-center */}
        <img
          src="/logo.png"
          alt="EduLang Logo"
          className="h-8 w-auto dark:invert" // Changé de h-8 à h-16 pour doubler la taille
        />
      </div>
      <div className="hidden lg:flex space-x-4">
        <Link to="/" className="hover:text-gray-300">
          Dashboard
        </Link>
        <Link to="/browse" className="hover:text-gray-300">
          Browse
        </Link>
        {/* Add more navigation links here */}
      </div>
      <div className="lg:hidden">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="focus:outline-none"
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
