import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { InterviewSession } from '../types';
import { PlayCircle, Trash2, RotateCcw, FileText } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sessions, deleteSession } = useData();

  const [selectedReportSession, setSelectedReportSession] = useState<InterviewSession | null>(null);

  const userSessions = sessions.filter(s => s.candidateEmail === currentUser?.email);
  const totalInterviews = userSessions.length;
  const avgScore = totalInterviews > 0
    ? Math.round(userSessions.reduce((acc, s) => acc + s.score, 0) / totalInterviews)
    : 0;

  const totalTimeSeconds = userSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalTimeMinutes = Math.max(1, Math.round(totalTimeSeconds / 60));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white">Welcome back!</h2>
          <p className="text-xs text-gray-400 mt-1">Here is how your interview preparations look so far.</p>
        </div>

        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
        >
          <PlayCircle className="w-4 h-4 fill-current" />
          <span>New Interview Session</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Interviews Conducted</p>
          <div className="text-4xl font-black text-white">{totalInterviews}</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Average Evaluation Score</p>
          <div className="text-4xl font-black text-purple-400">{avgScore}%</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Total Training Time</p>
          <div className="text-4xl font-black text-cyan-400">{totalTimeMinutes} min</div>
        </div>
      </div>

      {/* Analytics Row: Performance Over Time & Feedback Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Over Time Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-4">Performance Over Time</h3>
          <div className="h-44 w-full flex items-end justify-between px-4 pb-2 border-b border-l border-white/20 text-[10px] text-gray-400 relative">
            <span className="absolute left-1 top-2 text-[10px]">100%</span>
            <span className="absolute left-1 top-1/2 text-[10px]">50%</span>
            <span className="absolute left-1 bottom-6 text-[10px]">0%</span>

            {userSessions.length > 0 ? (
              userSessions.map((s, idx) => (
                <div key={s.id} className="flex flex-col items-center gap-1 group">
                  <div
                    className="w-8 btn-gradient rounded-t-lg transition-all"
                    style={{ height: `${Math.max(15, (s.score / 100) * 120)}px` }}
                  />
                  <span>Session {idx + 1}</span>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-gray-500">No session data available yet</div>
            )}
          </div>
        </div>

        {/* Feedback Keyword Highlights */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Feedback Keyword Highlights</h3>
            <p className="text-xs text-gray-400">Frequency of analytical topics flagged in your evaluations. High counts indicate focused evaluator inputs.</p>
          </div>
          <div className="py-12 text-center text-xs text-gray-400 italic">
            No speech analytical details processed yet.
          </div>
        </div>
      </div>

      {/* Interview History Log */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Interview History Log</h3>
        </div>

        <div className="space-y-3">
          {userSessions.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  {s.targetTrack[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{s.targetTrack}</h4>
                    {s.isTailored && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Resume Tailored
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.completedDate} • Duration: 0m {s.durationSeconds}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/practice', { state: { targetRole: s.targetTrack } })}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resume Tailored</span>
                </button>

                <button
                  onClick={() => setSelectedReportSession(s)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold border border-purple-500/30 transition flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => deleteSession(s.id)}
                  className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedReportSession && (
        <Modal
          isOpen={!!selectedReportSession}
          onClose={() => setSelectedReportSession(null)}
          title={`Session Details - ${selectedReportSession.targetTrack}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
              <div>
                <p className="text-gray-400">Date:</p>
                <p className="font-bold text-white">{selectedReportSession.completedDate}</p>
              </div>
              <div>
                <p className="text-gray-400">Score:</p>
                <p className="font-bold text-red-400">{selectedReportSession.score}%</p>
              </div>
              <div>
                <p className="text-gray-400">Duration:</p>
                <p className="font-bold text-cyan-400">0m {selectedReportSession.durationSeconds}s</p>
              </div>
            </div>

            {selectedReportSession.evaluations?.map((ev, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <p className="font-bold text-purple-300">Q{i + 1}: {ev.questionTitle}</p>
                <p className="text-gray-400">Your Answer: <span className="text-white">{ev.userAnswer}</span></p>
                <p className="text-gray-300 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/20">{ev.speechContentEval}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
