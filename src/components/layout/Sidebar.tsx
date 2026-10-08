import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  PlayCircle, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home, show: true },
    { label: 'Admin Panel', path: '/admin', icon: ShieldCheck, show: currentUser?.role === 'ADMIN' },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
    { label: 'Question Bank', path: '/question-bank', icon: BookOpen, show: true },
    { label: 'Practice', path: '/practice', icon: PlayCircle, show: true },
    { label: 'Settings', path: '/settings', icon: Settings, show: true },
  ];

  return (
    <>
      <aside className="w-64 glass-panel border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl font-black text-white">A</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                InterviewAce
              </h1>
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Mock Partner
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 capitalize">
                {currentUser?.role === 'ADMIN' ? 'Admin Account' : 'User Account'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {navItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/20 text-white border border-purple-500/40 shadow-md shadow-purple-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOutClick}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        message="Are you sure you want to sign out of InterviewAce?"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </>
  );
};
