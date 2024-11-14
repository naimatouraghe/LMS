// src/components/Sidebar.js
import { useAuth } from '../../contexts/AuthContext';
import MainNavLinks from './MainNavLinks';
import TeacherNavLinks from './TeacherNavLinks';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">LMSAPP</h1>
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
