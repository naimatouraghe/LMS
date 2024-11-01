// src/components/Sidebar.js
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="flex flex-col h-full p-4">
            <h1 className="text-xl font-bold mb-4">LMS App</h1>
            <Link to="/" className="text-gray-300 hover:text-white py-2">Dashboard</Link>
            <Link to="/browse" className="text-gray-300 hover:text-white py-2">Browse</Link>
            {/* Add more navigation links here */}
        </div>
    );
};

export default Sidebar;
