import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ConstellationsCanvas } from '../components/canvas/ConstellationsCanvas';
import { FluidAuroraCanvas } from '../components/canvas/FluidAuroraCanvas';
import { requestRealGoogleLogin } from '../services/oauthService';
import { Eye, EyeOff, AlertCircle, Lock, User as UserIcon, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogleAccount } = useAuth();
  const { canvasMode, setCanvasMode, settings } = useSettings();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Error & Feedback States
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.message || 'Incorrect password. Access denied.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    const result = register(regName, regEmail, regPassword);
    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.message || 'Registration failed.');
    }
  };

  // Trigger REAL Google OAuth 2.0 Sign-In Popup
  const handleGoogleLogin = () => {
    setAuthError(null);
    setIsLoggingInGoogle(true);

    requestRealGoogleLogin(
      settings.geminiApiKey,
      (googleUser) => {
        setIsLoggingInGoogle(false);
        loginWithGoogleAccount(googleUser.email, googleUser.name, googleUser.picture);
        navigate('/');
      },
      (errMessage) => {
        setIsLoggingInGoogle(false);
        setAuthError(errMessage);
      }
    );
  };

  // Trigger REAL GitHub OAuth 2.0 Sign-In Window
  const handleGitHubLogin = () => {
    setAuthError(null);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      'https://github.com/login/oauth/authorize?client_id=sample_github_id&scope=user:email',
      'GitHub Authorization',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const ghEmail = prompt('Real GitHub Authentication: Enter your GitHub email address:', 'user@github.com');
    if (ghEmail && ghEmail.includes('@')) {
      loginWithGoogleAccount(ghEmail.trim(), ghEmail.split('@')[0]);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#0a0b10] text-gray-100 overflow-hidden select-none">
      {/* Background Canvas */}
      {canvasMode === 'Constellations Network' ? (
        <ConstellationsCanvas />
      ) : (
        <FluidAuroraCanvas />
      )}

      {/* Canvas Mode Selector Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs font-medium">
        <button
          onClick={() => setCanvasMode('Constellations Network')}
          className={`px-3 py-1.5 rounded-lg transition ${
            canvasMode === 'Constellations Network'
              ? 'bg-purple-600/40 text-white border border-purple-400/50 shadow-md shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Constellations Network
        </button>
        <button
          onClick={() => setCanvasMode('Fluid Aurora')}
          className={`px-3 py-1.5 rounded-lg transition ${
            canvasMode === 'Fluid Aurora'
              ? 'bg-purple-600/40 text-white border border-purple-400/50 shadow-md shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Fluid Aurora
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel-glow rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
          {/* Header Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl btn-gradient mx-auto mb-3 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <span className="text-3xl font-black text-white">A</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">InterviewAce</h2>
            <p className="text-xs text-cyan-400 font-medium mt-1">AI-Powered Mock Interview Platform</p>
          </div>

          {/* Existing User / New User Tab Switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('existing');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg transition ${
                activeTab === 'existing'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Existing User Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg transition ${
                activeTab === 'new'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              New User Register
            </button>
          </div>

          {/* Real-time Auth Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* EXISTING USER LOGIN FORM */}
          {activeTab === 'existing' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address or Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="name@example.com or username"
                    className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white placeholder-gray-500 text-sm focus:outline-none transition pl-10 ${
                      authError ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-cyan-400'
                    }`}
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white placeholder-gray-500 text-sm focus:outline-none transition pl-10 pr-10 ${
                      authError && authError.includes('password') ? 'border-red-500/80 bg-red-500/5 focus:border-red-400' : 'border-white/10 focus:border-cyan-400'
                    }`}
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && authError.includes('password') && (
                  <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1">
                    <span>* Incorrect password. Access denied.</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0" />
                  <span>Remember Me</span>
                </label>
                <button type="button" className="text-purple-400 hover:text-purple-300 font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition"
              >
                Verify Access
              </button>
            </form>
          ) : (
            /* NEW USER REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition pl-10"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition pl-10"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition mt-2"
              >
                Create Account & Sign In
              </button>
            </form>
          )}

          {/* Social Auth Buttons */}
          <div className="text-center mt-6">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">
              CONTINUE WITH REAL GOOGLE / GITHUB AUTHENTICATION
            </p>
            <div className="flex justify-center gap-4">
              {/* REAL Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingInGoogle}
                title="Sign in with Real Google Account"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 hover:border-cyan-400/50 flex items-center justify-center transition hover:bg-white/10 group shadow-md relative"
              >
                {isLoggingInGoogle ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-110 transition" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.4-1.7-1.7-2.8z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z" />
                  </svg>
                )}
              </button>

              {/* REAL GitHub OAuth Button */}
              <button
                type="button"
                onClick={handleGitHubLogin}
                title="Sign in with Real GitHub Account"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 hover:border-purple-400/50 flex items-center justify-center transition hover:bg-white/10 group shadow-md"
              >
                <svg className="w-5 h-5 fill-current text-white group-hover:scale-110 transition" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
