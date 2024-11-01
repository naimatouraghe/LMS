import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-x-2">
      <img
        src="/logo.svg"
        alt="Logo"
        className="h-10 w-10"
      />
      <span className="font-bold text-xl">
        Logoipsum
      </span>
    </Link>
  );
};

const NavbarDekstop = () => {
  return (
    <div className="p-4 h-full flex items-center justify-between bg-white border-b">
      {/* Logo & Search Section */}
      <div className="flex items-center flex-1 gap-x-4">
     
        <div className="hidden md:flex flex-1 relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for a course"
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-x-4">
        <div className="hidden md:flex">
          <button className="text-sm font-medium">
            Teacher mode
          </button>
        </div>
        <div className="h-10 w-10 relative">
          <button className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-700 transition">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarDekstop;