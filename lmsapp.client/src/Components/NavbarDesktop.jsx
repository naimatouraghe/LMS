import { User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '@/utils/axios';
import debounce from 'lodash/debounce';

const NavbarDesktop = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fonction de recherche
  const searchCourses = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axiosInstance.get('/Course', {
        params: {
          searchTerm: query.trim(),
        },
      });
      console.log('Search response:', response.data);
      const results = response.data || [];
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchCourses(query);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    console.log('Search query:', query);
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search result click
  const handleResultClick = (courseId) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/courses/${courseId}`);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/Auth/logout');
      logout(); // Fonction du contexte d'authentification
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Vous pouvez ajouter une notification d'erreur ici si vous le souhaitez
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ajout d'un useEffect pour surveiller les changements de searchResults
  useEffect(() => {
    console.log('Updated search results:', searchResults);
  }, [searchResults]);

  // Construire l'URL de l'avatar
  const avatarUrl = user?.avatarPath
    ? `${import.meta.env.VITE_API_URL}${user.avatarPath}`
    : null;

  return (
    <nav className="hidden lg:flex h-[80px] items-center justify-between px-6 bg-white shadow">
      {/* Search section */}
      <div className="flex-1 max-w-2xl mx-4" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a course"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
            ) : (
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
            )}
          </button>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 &&
            console.log('Rendering dropdown with results:', searchResults)}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
              {searchResults.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleResultClick(course.id)}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  {course.imageUrl && (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {course.category?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Conditional Rendering */}
      {isAuthenticated ? (
        <div className="flex items-center gap-x-4">
          <div className="hidden md:flex items-center">
            <span className="text-sm font-medium text-slate-700">
              {user?.fullName}
            </span>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              className="h-10 w-10 rounded-full flex items-center justify-center hover:opacity-80 transition overflow-hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-700">
                  <User className="h-5 w-5" />
                </div>
              )}
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
