import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NavLinks = ({ onClickLink }) => {
  const { user, isAuthenticated } = useAuth();

  // Liens pour utilisateurs anonymes
  const anonymousLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/', label: 'Browse' },
  ];

  // Liens communs aux utilisateurs authentifiés
  const commonLinks = [
    { to: '/', label: 'Browse' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  // Liens spécifiques par rôle
  const roleSpecificLinks = {
    Admin: [
      { to: '/', label: 'Admin Dashboard' },
      { to: '/admin/users', label: 'Users Management' },
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/statistics', label: 'Statistics' },
    ],
    Teacher: [
      { to: '/', label: 'Teacher Dashboard' },
      { to: '/teacher/courses', label: 'My Courses' },
      { to: '/teacher/analytics', label: 'Analytics' },
      { to: '/teacher/earnings', label: 'Earnings' },
    ],
  };

  // Sélectionner les liens en fonction de l'authentification et du rôle
  const links = isAuthenticated
    ? [...(roleSpecificLinks[user.role] || []), ...commonLinks]
    : anonymousLinks;

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-white py-4 text-xl hover:text-gray-300 transition"
          onClick={onClickLink}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
