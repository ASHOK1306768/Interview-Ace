import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Play, BookOpen, ArrowRight, Code2, BrainCircuit, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { sessions } = useData();
  const navigate = useNavigate();

  // User specific metrics calculation
  const userSessions = sessions.filter(s => s.candidateEmail === currentUser?.email);
  const sessionCount = userSessions.length;
  const avgScore = sessionCount > 0 
    ? Math.round(userSessions.reduce((acc, s) => acc + s.score, 0) / sessionCount) 
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner Card */}
      <div className="glass-panel-glow rounded-3xl p-8 border border-purple-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED MOCK INTERVIEW PLATFORM</span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-3">
            Welcome to InterviewAce, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">{currentUser?.name}!</span>
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Sharpen your communication, master technical algorithms, and ace logical reasoning tests.
            Receive real-time speech analytics, feedback, and custom evaluation reports powered by Gemini AI.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/practice')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Practice Mock Interview</span>
            </button>

            <button
              onClick={() => navigate('/question-bank')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Browse Question Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">PRACTICED SESSIONS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{sessionCount}</span>
            <span className="text-xs text-gray-400 font-medium">Sessions</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">AVERAGE SCORE</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">{avgScore}%</span>
            <span className="text-xs text-gray-400 font-medium">ACCURACY</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">USER PROGRESS</p>
            <p className="text-xs text-gray-300">Track performance analytics and feedback logs</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition mt-4"
          >
            <span>View Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Specialized Focus Areas */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Specialized Focus Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Focus Area 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-white mb-1">Coding & Algorithms</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Practice core programming problems: Palindromes, Two Sum, arrays, string parsing, and linked lists. Write solutions, talk through logic, and test your big-O timing structure.
                </p>
                <button
                  onClick={() => navigate('/practice', { state: { targetRole: 'Coding Problems' } })}
                  className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold transition"
                >
                  Select Coding Practice
                </button>
              </div>
            </div>
          </div>

          {/* Focus Area 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-white mb-1">Aptitude & Logical Puzzles</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Solve fast-paced logical problems, clock geometry, probability reasoning, and water-jug puzzles. Test your numeric deduction and problem-solving skills under time limits.
                </p>
                <button
                  onClick={() => navigate('/practice', { state: { targetRole: 'Aptitude & Logic' } })}
                  className="px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold transition"
                >
                  Select Aptitude Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
