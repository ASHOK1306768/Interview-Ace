import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { evaluateInterviewResponses } from '../services/aiService';
import { InterviewSession, QuestionEvaluation } from '../types';
import { ChevronDown, ChevronUp, LayoutDashboard, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const EvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { addSession } = useData();
  const { settings } = useSettings();

  const stateData = (location.state as any) || {};
  const { sessionConfig = { targetRole: 'Coding Problems', experienceLevel: 'Entry-Level (0-2 years)' }, questions = [], userAnswers = {}, durationSeconds = 21 } = stateData;

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(20);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    verdict: 'Requires Practice' | 'Good Performance' | 'Exemplary Mastery';
    evaluations: QuestionEvaluation[];
  } | null>(null);

  const [expandedQId, setExpandedQId] = useState<number | null>(questions[0]?.id || null);
  const [showAnswerStructure, setShowAnswerStructure] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Simulate grading animation progress
    const pInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(pInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 400);

    // Evaluate responses
    evaluateInterviewResponses(settings.geminiApiKey, questions, userAnswers).then(result => {
      setEvaluationResult(result);
      setTimeout(() => {
        setIsLoading(false);

        // Save session log to context
        if (currentUser) {
          const newSession: InterviewSession = {
            id: `s_${Date.now()}`,
            candidateName: currentUser.name,
            candidateEmail: currentUser.email,
            targetTrack: sessionConfig.targetRole,
            experienceLevel: sessionConfig.experienceLevel,
            durationSeconds,
            score: result.score,
            verdict: result.verdict,
            completedDate: new Date().toLocaleDateString('en-US'),
            evaluations: result.evaluations
          };
          addSession(newSession);
        }
      }, 1600);
    });

    return () => clearInterval(pInterval);
  }, []);

  const toggleStructure = (qId: number) => {
    setShowAnswerStructure(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-purple-500/40 text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-2xl btn-gradient mx-auto flex items-center justify-center shadow-xl shadow-purple-500/30 animate-spin">
            <Award className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">Evaluating Session</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Our AI engine is grading your responses, analyzing fluency patterns, and generating improvement suggestions.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/10 p-0.5">
              <div
                className="btn-gradient h-full rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs font-mono text-cyan-400 font-semibold">Analyzing responses {loadingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  const { score = 0, verdict = 'Requires Practice', evaluations = [] } = evaluationResult || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner Result Card */}
      <div className="glass-panel-glow p-8 rounded-3xl border border-purple-500/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
            {sessionConfig.targetRole}
          </span>
          <h2 className="text-3xl font-black text-white">Evaluation Feedback</h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Grade Verdict: <strong>{verdict}</strong></span>
            </div>
            <span>•</span>
            <span>Duration: 0m {durationSeconds}s</span>
            <span>•</span>
            <span>{sessionConfig.experienceLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Score Badge */}
          <div className="text-center p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[110px]">
            <div className="text-4xl font-black text-red-400">{score}%</div>
            <div className="text-[10px] uppercase font-bold text-gray-400">SCORE</div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gradient text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>To Dashboard</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Detailed Question Breakdown</h3>
        <p className="text-xs text-gray-400">Click on any question card below to expand detailed verbal analysis, grammar reviews, and model structures.</p>

        <div className="space-y-3">
          {evaluations.map((ev, idx) => {
            const isExpanded = expandedQId === ev.questionId;
            const isShowStructure = showAnswerStructure[ev.questionId];

            return (
              <div
                key={ev.questionId}
                className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedQId(isExpanded ? null : ev.questionId)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase text-purple-400">QUESTION {idx + 1}</span>
                    <h4 className="text-sm font-semibold text-white truncate max-w-xl">"{ev.questionTitle}"</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300">
                      0%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-white/10 bg-black/30 space-y-4 text-xs">
                    {/* User Answer */}
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">YOUR ANSWER</p>
                      <p className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 italic font-mono">
                        "{ev.userAnswer}"
                      </p>
                    </div>

                    {/* Speech & Content Evaluation */}
                    <div>
                      <p className="text-[10px] font-bold uppercase text-cyan-400 mb-1">SPEECH & CONTENT EVALUATION</p>
                      <p className="text-gray-300 leading-relaxed bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                        {ev.speechContentEval}
                      </p>
                    </div>

                    {/* Recommended Structure Toggle */}
                    <div>
                      <button
                        onClick={() => toggleStructure(ev.questionId)}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline"
                      >
                        {isShowStructure ? 'Hide Recommended Answer Structure' : 'Show Recommended Answer Structure'}
                      </button>

                      {isShowStructure && (
                        <div className="mt-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-gray-200 leading-relaxed">
                          <p className="font-semibold text-purple-300 mb-1">Ideal Model Answer Structure:</p>
                          {ev.recommendedAnswerStructure}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
