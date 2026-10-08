import React from 'react';
import { Volume2, Mic } from 'lucide-react';

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({ isSpeaking, isListening }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Background glow when active */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-cyan-500/10 to-transparent transition-opacity duration-700 ${isSpeaking ? 'opacity-100' : 'opacity-30'}`} />

      {/* Avatar Container */}
      <div className="relative mb-4">
        {/* Pulsing rings when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
            <div className="absolute -inset-2 rounded-full bg-purple-600/30 animate-pulse" />
          </>
        )}

        <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-gray-900 to-gray-800 border-2 border-cyan-400/50 flex items-center justify-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-black/60 border border-purple-500/30 flex items-center justify-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            AI
          </div>
        </div>
      </div>

      <h4 className="text-lg font-bold text-white mb-1">Interviewer Avatar</h4>

      {/* Status Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-cyan-300">
        {isSpeaking ? (
          <>
            <Volume2 className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
            <span>Reading question out loud...</span>
          </>
        ) : isListening ? (
          <>
            <Mic className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Listening for response...</span>
          </>
        ) : (
          <span>Ready for answer</span>
        )}
      </div>
    </div>
  );
};
