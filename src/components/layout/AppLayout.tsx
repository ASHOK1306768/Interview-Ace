import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSettings } from '../../context/SettingsContext';
import { ConstellationsCanvas } from '../canvas/ConstellationsCanvas';
import { FluidAuroraCanvas } from '../canvas/FluidAuroraCanvas';

export const AppLayout: React.FC = () => {
  const { canvasMode } = useSettings();

  return (
    <div className="flex min-h-screen relative bg-[#0a0b10] text-gray-100 overflow-x-hidden">
      {/* Background canvas effects */}
      {canvasMode === 'Constellations Network' ? (
        <ConstellationsCanvas />
      ) : (
        <FluidAuroraCanvas />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-white/5 text-xs text-gray-500 flex items-center justify-between">
          <div>
            © 2026 InterviewAce. All Rights Reserved. Logged in as: <span className="text-gray-300 font-medium">{localStorage.getItem('interview_ace_current_user') ? JSON.parse(localStorage.getItem('interview_ace_current_user')!).name : 'User'}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-white transition">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-white transition">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-white transition">GitHub Repository</button>
          </div>
        </footer>
      </div>
    </div>
  );
};
