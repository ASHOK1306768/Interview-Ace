import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Key, Eye, EyeOff, Volume2, Video, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [voiceAccent, setVoiceAccent] = useState(settings.voiceAccent);
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled);
  const [cameraEnabled, setCameraEnabled] = useState(settings.cameraEnabled);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      geminiApiKey,
      voiceAccent,
      ttsEnabled,
      cameraEnabled
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-white">Application Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure API Key, voice controls, and simulation preferences.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel-glow p-8 rounded-3xl border border-purple-500/30 space-y-6">
        {/* Gemini API Key */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Gemini API Key <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Paste your Gemini API key from Google AI Studio..."
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
            <p className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Key className="w-3.5 h-3.5" />
              <span>We support both offline local evaluation and live AI interviews.</span>
            </p>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Paste your Gemini API key from Google AI Studio to enable dynamic, smart feedback. Keys are saved <strong>locally</strong> in your browser storage.
            </p>
          </div>
        </div>

        {/* Interviewer Voice Accent */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Interviewer Voice Accent</label>
          <select
            value={voiceAccent}
            onChange={(e) => setVoiceAccent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="Default Browser Voice" className="bg-gray-900 text-white">Default Browser Voice</option>
            <option value="US Female" className="bg-gray-900 text-white">US Female (Synthetic)</option>
            <option value="US Male" className="bg-gray-900 text-white">US Male (Synthetic)</option>
            <option value="UK Accent" className="bg-gray-900 text-white">UK Accent (Synthetic)</option>
          </select>
        </div>

        {/* Checkbox 1: Speak Questions Out Loud */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <input
            type="checkbox"
            id="tts"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
            className="mt-1 rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="tts" className="cursor-pointer">
            <span className="text-xs font-bold text-white block flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Speak Questions Out Loud (Text-to-Speech)
            </span>
            <span className="text-[11px] text-gray-400">The AI interviewer will vocalize questions to simulate a live video call.</span>
          </label>
        </div>

        {/* Checkbox 2: Request Camera Access */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <input
            type="checkbox"
            id="camera"
            checked={cameraEnabled}
            onChange={(e) => setCameraEnabled(e.target.checked)}
            className="mt-1 rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="camera" className="cursor-pointer">
            <span className="text-xs font-bold text-white block flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              Request Camera Access (Simulate Webcam Stream)
            </span>
            <span className="text-[11px] text-gray-400">Shows your local webcam feed in the interview panel for video preview.</span>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl btn-gradient text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition"
          >
            Save Settings
          </button>

          {savedToast && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
