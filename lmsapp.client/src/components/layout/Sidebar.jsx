// src/components/Sidebar.js
import { useAuth } from '../../contexts/AuthContext';
import MainNavLinks from './MainNavLinks';
import TeacherNavLinks from './TeacherNavLinks';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-12">
        <div className="flex items-center">
          <img
            src="/logo.png" // Chemin direct depuis public
            // OU si dans un sous-dossier : "/images/logo.png"
            alt="LMSAPP Logo"
            className="h-14 w-auto dark:invert" // ajout de dark:invert si vous voulez que le logo s'inverse en mode sombre
          />
        </div>
        {user && <p className="text-gray-400 mt-2">Welcome, {user.fullName}</p>}
      </div>

      <nav className="flex-grow">
        <MainNavLinks />
      </nav>

      <div className="border-t border-gray-700 my-4"></div>

      <TeacherNavLinks />
    </div>
  );
};

export default Sidebar;
