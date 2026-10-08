import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CategoryTrack } from '../types';
import { 
  Users, 
  FileSpreadsheet, 
  BarChart3, 
  BookOpen, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const AdminPage: React.FC = () => {
  const { currentUser, users, updateUserRole } = useAuth();
  const { questions, sessions, addQuestion, deleteQuestion, restoreDefaultQuestions } = useData();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'logs' | 'questions'>('metrics');
  const [selectedTrack, setSelectedTrack] = useState<CategoryTrack>('Frontend Dev');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedSessionReport, setSelectedSessionReport] = useState<any | null>(null);

  // Admin access protection check
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Access Restricted</h3>
        <p className="text-sm text-gray-400">You must be logged in as an Administrator to access the Admin Panel.</p>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const candidateCount = users.filter(u => u.role === 'USER').length;
  const trackQuestions = questions.filter(q => q.category === selectedTrack);

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    addQuestion({
      category: selectedTrack,
      title: newQuestionText.trim(),
      idealStructure: `Structure response systematically for ${selectedTrack}.`
    });
    setNewQuestionText('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1">
            ADMINISTRATOR ACCOUNT DASHBOARD
          </div>
          <h2 className="text-2xl font-black text-white">
            Welcome Back, {currentUser.name}!
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Monitor candidates, edit question banks, and audit interview feedback logs.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('metrics')}
          className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold transition"
        >
          Try Simulator Run
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-semibold space-x-6">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 pb-3 transition border-b-2 ${
            activeTab === 'metrics'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Metrics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3 transition border-b-2 ${
            activeTab === 'users'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 pb-3 transition border-b-2 ${
            activeTab === 'logs'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Interview Log Audit ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 pb-3 transition border-b-2 ${
            activeTab === 'questions'
              ? 'border-purple-500 text-white font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question Banks</span>
        </button>
      </div>

      {/* TAB 1: Metrics Overview */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">PROFILES REGISTERED</p>
              <div className="text-3xl font-black text-white">{users.length}</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">INTERVIEWS CONDUCTED</p>
              <div className="text-3xl font-black text-purple-400">{sessions.length}</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">SYSTEM AVERAGE SCORE</p>
              <div className="text-3xl font-black text-cyan-400">0%</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">QUICK SYSTEM ACTIONS</p>
              <div className="text-xs text-gray-300 mb-2">
                System Duration Logged: <strong className="text-white">0 mins total</strong>
              </div>
              <div className="flex items-center gap-2 mb-3 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">Admins: {adminCount}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">Candidates: {candidateCount}</span>
              </div>
              <button
                onClick={restoreDefaultQuestions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore System Default Questions</span>
              </button>
            </div>
          </div>

          {/* Timeline Placeholder */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center py-12">
            <h4 className="text-sm font-bold text-white mb-2">Global System Performance Timeline</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              At least 2 global interview sessions are required to construct the system analytics graph.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: User Directory */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Active User Database</h3>
            <p className="text-xs text-gray-400">Modify clearance roles, clear data access privileges, or manage candidate profiles.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email Profile</th>
                  <th className="p-4">Clearance Role</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-semibold text-white">
                      {u.name} {u.id === currentUser.id && <span className="text-[10px] text-cyan-400 font-normal">(You)</span>}
                    </td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{u.createdDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => updateUserRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Interview Log Audit */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Global Interview Logs</h3>
            <p className="text-xs text-gray-400">Auditing evaluation logs submitted by all registered users.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Target Job Role</th>
                  <th className="p-4">Evaluation Score</th>
                  <th className="p-4">Training Session</th>
                  <th className="p-4">Completed Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-semibold text-white">{s.candidateName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {s.targetTrack}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-red-400">{s.score}%</td>
                    <td className="p-4 text-gray-400">0m {s.durationSeconds}s</td>
                    <td className="p-4 text-gray-400">{s.completedDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedSessionReport(s)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium transition border border-cyan-500/30"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Question Banks */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Target Track Selector */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3">TARGET SIMULATION TRACK</p>
            {[
              'Frontend Dev',
              'Backend Dev',
              'Data Science / ML',
              'Product Management',
              'Behavioral & HR'
            ].map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track as CategoryTrack)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition ${
                  selectedTrack === track
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{track}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40">
                  {questions.filter(q => q.category === track).length}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Track Pool */}
          <div className="md:col-span-3 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider mb-1">SELECTED TRACK POOL</p>
              <h3 className="text-lg font-bold text-white">{selectedTrack} Questions</h3>
            </div>

            {/* Add Question Form */}
            <form onSubmit={handleAddCustomQuestion} className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Create custom interview question..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-gradient text-white font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Question List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {trackQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4 hover:border-white/20 transition"
                >
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-purple-400">{idx + 1}.</span>
                    <p className="text-xs text-gray-200 leading-relaxed">{q.title}</p>
                  </div>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="text-gray-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Audit Modal */}
      {selectedSessionReport && (
        <Modal
          isOpen={!!selectedSessionReport}
          onClose={() => setSelectedSessionReport(null)}
          title={`Interview Evaluation Audit - ${selectedSessionReport.candidateName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-gray-400">Target Track:</p>
                <p className="font-bold text-white">{selectedSessionReport.targetTrack}</p>
              </div>
              <div>
                <p className="text-gray-400">Score:</p>
                <p className="font-bold text-red-400">{selectedSessionReport.score}%</p>
              </div>
            </div>

            {selectedSessionReport.evaluations?.map((ev: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <p className="font-bold text-purple-300">Q{i + 1}: {ev.questionTitle}</p>
                <p className="text-gray-400">Answer: <span className="text-white">{ev.userAnswer}</span></p>
                <p className="text-gray-300">{ev.speechContentEval}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
