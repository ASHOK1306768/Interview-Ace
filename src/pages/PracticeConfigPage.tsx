import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FileText, PlayCircle } from 'lucide-react';

export const PracticeConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialRole = (location.state as any)?.targetRole || 'Frontend Developer';

  const [targetRole, setTargetRole] = useState(initialRole);
  const [experienceLevel, setExperienceLevel] = useState('Entry-Level (0-2 years)');
  const [resumeText, setResumeText] = useState('');

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Data Sci / ML Engineer',
    'Product Manager',
    'Behavioral / General HR',
    'Aptitude & Logic',
    'Coding Problems',
    'Custom Role...'
  ];

  const experienceLevels = [
    'Entry-Level (0-2 years)',
    'Mid-Level (3-5 years)',
    'Senior-Level (5+ years)',
    'Lead / Staff'
  ];

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/interview', {
      state: {
        targetRole,
        experienceLevel,
        resumeText
      }
    });
  };

  const handleQuickPasteSample = () => {
    setResumeText(
      'Experienced React/TypeScript developer with 2+ years building modern web applications, state management (Redux/Context), Tailwind CSS, Node.js REST APIs, and Web Speech API integrations.'
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Configure Your Interview Session</h2>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          Set your parameters, tailor with your resume details, and let our engine design the perfect questions.
        </p>
      </div>

      <form onSubmit={handleStartSession} className="glass-panel-glow p-8 rounded-3xl border border-purple-500/30 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Job Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Target Job Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {experienceLevels.map(l => (
                <option key={l} value={l} className="bg-gray-900 text-white">{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resume / Skills Sheet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-300">
              Resume Text / Skills Sheet <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={handleQuickPasteSample}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <FileText className="w-3 h-3" />
              <span>Paste Sample Resume</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content, list of projects, or primary technologies here..."
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400 transition"
          />
          <p className="text-[10px] text-gray-400 mt-1">Posting this generates personalized questions targeting your background.</p>
        </div>

        {/* Gemini AI Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Gemini AI Engine Active</h4>
            <p className="text-[10px] text-gray-300">Questions will be dynamically structured by Gemini for your background.</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl btn-gradient text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5 fill-current" />
          <span>Start Mock Interview</span>
        </button>
      </form>
    </div>
  );
};
