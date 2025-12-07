import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Users, Settings, Activity, LogOut, User } from 'lucide-react';
import { useAuth } from '@/services/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Live Monitor', to: '/monitor', icon: Activity },
    { name: 'Contacts', to: '/contacts', icon: Users },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-rose-500 flex items-center justify-center">
          <ShieldAlert className="text-white h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">SafeGuard</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-900/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}
            `}
          >
            <link.icon className="h-5 w-5" />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>

        <div className="bg-zinc-900/50 rounded-lg p-4">
          <p className="text-xs text-zinc-500 uppercase font-semibold">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-zinc-300">Online & Secure</span>
          </div>
        </div>
      </div>
    </aside>
  );
}