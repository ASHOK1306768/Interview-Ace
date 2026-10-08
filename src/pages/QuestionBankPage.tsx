import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CategoryTrack } from '../types';
import { Play, Copy, Check } from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const { getQuestionsByCategory } = useData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryTrack>('Coding Problems');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories: CategoryTrack[] = [
    'Coding Problems',
    'Aptitude & Logic',
    'Frontend Dev',
    'Backend Dev',
    'Data Science / ML',
    'Product Management',
    'Behavioral & HR',
    'Company Requirements',
    'General FAQ'
  ];

  const questionsList = getQuestionsByCategory(selectedCategory);

  const handleCopyQuestion = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
      {/* Category Selection Sidebar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1.5 h-fit">
        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-2">SELECT CATEGORY</p>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{cat}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-300">100</span>
          </button>
        ))}
      </div>

      {/* Main Question Display Area */}
      <div className="md:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{selectedCategory}</h2>
            <p className="text-xs text-gray-400">Practice or manage mock interview sessions with questions in this bank.</p>
          </div>

          <button
            onClick={() => navigate('/practice', { state: { targetRole: selectedCategory } })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice this Bank</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {questionsList.map((q, idx) => (
            <div
              key={q.id}
              className="glass-panel p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition flex items-start justify-between gap-4 group"
            >
              <div className="flex gap-4">
                <span className="text-xs font-bold text-purple-400 min-w-[24px]">{idx + 1}</span>
                <div>
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">{q.title}</p>
                </div>
              </div>

              <button
                onClick={() => handleCopyQuestion(q.id, q.title)}
                className="text-gray-500 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-white/5 transition"
                title="Copy Question"
              >
                {copiedId === q.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
