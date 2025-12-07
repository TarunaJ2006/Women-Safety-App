import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Shield, LayoutDashboard, Users, History, Settings as SettingsIcon, Activity, LogOut, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-all ${
          isActive 
            ? 'bg-rose-500/10 text-rose-500' 
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-lg">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase italic">Guardia</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/monitor" icon={Activity}>Live Monitor</NavLink>
            <NavLink to="/contacts" icon={Users}>Network</NavLink>
            <NavLink to="/alerts" icon={History}>History</NavLink>
            <NavLink to="/settings" icon={SettingsIcon}>Settings</NavLink>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 font-bold transition-colors ml-4"
          >
            <span className="text-xs uppercase tracking-widest">Logout</span>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;