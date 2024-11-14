import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TeacherNavLinks = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.roles?.includes('Teacher')) {
    return null;
  }

  const teacherLinks = [
    { to: '/teacher', label: 'Courses' },
    { to: '/teacher/analytics', label: 'Analytics' },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {teacherLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-white py-2 text-xl hover:text-gray-300 transition"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default TeacherNavLinks;
