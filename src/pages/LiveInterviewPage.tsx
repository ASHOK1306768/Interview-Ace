import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { ttsService } from '../services/ttsService';
import { InterviewerAvatar } from '../components/interview/InterviewerAvatar';
import { AudioSpectrum } from '../components/interview/AudioSpectrum';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Question } from '../types';
import { Mic, MicOff, SkipForward, ArrowRight, Video, VideoOff } from 'lucide-react';

export const LiveInterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getQuestionsByCategory } = useData();
  const { settings } = useSettings();

  const sessionConfig = (location.state as any) || {
    targetRole: 'Coding Problems',
    experienceLevel: 'Entry-Level (0-2 years)'
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Timers & Speech state
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Speech recognition instance ref to prevent duplicate speech listeners
  const recognitionRef = useRef<any>(null);

  // Webcam stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasWebcam, setHasWebcam] = useState(false);

  // Dialog state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load questions
  useEffect(() => {
    const qList = getQuestionsByCategory(sessionConfig.targetRole as any).slice(0, 5);
    setQuestions(qList);
  }, [sessionConfig.targetRole]);

  // Session duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Speak current question on load
  useEffect(() => {
    if (questions.length > 0 && questions[currentIdx]) {
      const qText = questions[currentIdx].title;
      setIsSpeaking(true);
      ttsService.speak(qText, settings.ttsEnabled, settings.voiceAccent, () => {
        setIsSpeaking(false);
      });
    }
    return () => {
      ttsService.stop();
    };
  }, [currentIdx, questions, settings]);

  // Initialize webcam if enabled in settings
  useEffect(() => {
    if (!settings.cameraEnabled) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setHasWebcam(true);
        }
      })
      .catch(() => {
        setHasWebcam(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [settings.cameraEnabled]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Fixed Speech Recognition toggle - prevents repeating text multiple times
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can type your answer directly in the box below.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = false; // Disable interim results to prevent duplicate appends

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (e: any) => {
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          }
        }
        
        if (finalTranscript.trim()) {
          const cleanText = finalTranscript.trim();
          setCurrentAnswer(prev => {
            if (!prev) return cleanText;
            // Prevent duplicate appending if same phrase received twice
            if (prev.endsWith(cleanText)) return prev;
            return `${prev} ${cleanText}`;
          });
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleNextQuestion = () => {
    ttsService.stop();
    setIsSpeaking(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    // Save current answer
    const qId = questions[currentIdx].id;
    setUserAnswers(prev => ({ ...prev, [qId]: currentAnswer || '(No answer provided)' }));
    setCurrentAnswer('');

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finished all questions -> go to evaluation page
      navigate('/evaluation', {
        state: {
          sessionConfig,
          questions,
          userAnswers: { ...userAnswers, [qId]: currentAnswer || '(No answer provided)' },
          durationSeconds
        }
      });
    }
  };

  const handleSkipQuestion = () => {
    setCurrentAnswer('(No answer provided)');
    handleNextQuestion();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Session Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 px-6 rounded-2xl border border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
            {sessionConfig.targetRole}
          </span>
          <h3 className="text-lg font-bold text-white">
            Question {currentIdx + 1} of {questions.length}
          </h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400">SESSION DURATION</p>
            <p className="text-lg font-mono font-bold text-cyan-400">{formatTimer(durationSeconds)}</p>
          </div>

          <button
            onClick={() => setShowCancelConfirm(true)}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30 transition"
          >
            Cancel Interview
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Interviewer Avatar & Webcam */}
        <div className="md:col-span-5 space-y-6">
          <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />

          {/* Webcam Preview */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 relative min-h-[180px] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                {hasWebcam ? <Video className="w-4 h-4 text-green-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                Webcam Stream Preview
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasWebcam ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {hasWebcam ? 'Live Stream' : 'Feed offline'}
              </span>
            </div>

            <div className="relative w-full h-40 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${hasWebcam ? 'block' : 'hidden'}`}
              />
              {!hasWebcam && (
                <div className="text-center p-4">
                  <VideoOff className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Webcam feed is offline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question & Response Panel */}
        <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
          {/* Active Question Card */}
          <div className="glass-panel-glow p-6 rounded-2xl border border-purple-500/30">
            <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider mb-2 block">
              ACTIVE QUESTION
            </span>
            <h3 className="text-xl font-bold text-white leading-relaxed">
              "{currentQ?.title}"
            </h3>
          </div>

          {/* Response Transcription Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-2">Response Transcription</span>
              {/* Spectrum visualization */}
              <AudioSpectrum isListening={isListening} />

              <textarea
                rows={5}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Your answer will appear here dynamically as you speak, or you can type here directly..."
                className="w-full mt-3 p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={toggleSpeechRecognition}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  isListening
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Speaking' : 'Speak Your Answer'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkipQuestion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip Question</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
                >
                  <span>{currentIdx + 1 === questions.length ? 'Submit Interview for Evaluation' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Prompt */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        message="Cancel session? Progress will be lost."
        onConfirm={() => {
          setShowCancelConfirm(false);
          navigate('/practice');
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};
