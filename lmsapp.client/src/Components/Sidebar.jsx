// src/components/Sidebar.js
import { useAuth } from '../contexts/AuthContext';
import NavLinks from './Navigation/NavLinks';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">LMSAPP</h1>
        {user && <p className="text-gray-400 mt-2">Welcome, {user.fullName}</p>}
      </div>

      <nav className="flex-grow flex flex-col space-y-2">
        <NavLinks />
      </nav>

      {/* Autres éléments du sidebar (logout, etc.) */}
    </div>
  );
};

export default Sidebar;
