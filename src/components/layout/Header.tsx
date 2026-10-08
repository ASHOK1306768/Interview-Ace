import React from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>AI-POWERED MOCK INTERVIEW PLATFORM</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
        <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Gemini AI</span>
        </div>

        <span className="text-gray-600">|</span>

        <span>Logged in as: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role?.toLowerCase()})</span>
      </div>
    </header>
  );
};
