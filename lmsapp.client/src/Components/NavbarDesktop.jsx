import { User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

const NavbarDesktop = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="hidden lg:flex h-[80px] items-center justify-between px-6 bg-white shadow">
      {/* Logo/Brand section */}
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold text-gray-800">
          LMS
        </Link>
      </div>

      {/* Search section */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a course"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Section - Conditional Rendering */}
      {isAuthenticated ? (
        <div className="flex items-center gap-x-4">
          <div className="hidden md:flex">
            <button className="text-sm font-medium">
              Teacher mode
            </button>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-700 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <User className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <div className="border-t border-gray-100"></div>
                <button
    onClick={handleLogout}
    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
  >
    <LogOut className="h-4 w-4 mr-2" />
    Logout
  </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Link
            to="/login"
            className="flex items-center px-4 py-2 text-white bg-slate-900 rounded-md hover:bg-slate-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span>Login</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavbarDesktop;