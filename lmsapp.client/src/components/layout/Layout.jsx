import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NavLinks from './MainNavLinks';

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
        <div className={`${isCoursePage ? 'p-0' : 'p-6'}`}>{children}</div>
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
              <NavLinks onClickLink={() => setIsMenuOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
