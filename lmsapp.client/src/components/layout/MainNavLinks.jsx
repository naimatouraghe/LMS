import { Link } from 'react-router-dom';

const MainNavLinks = () => {
  const links = [
    { to: '/', label: 'Browse' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {links.map((link) => (
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

export default MainNavLinks;
