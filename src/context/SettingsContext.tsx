import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, CanvasMode } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  canvasMode: CanvasMode;
  setCanvasMode: (mode: CanvasMode) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  voiceAccent: 'Default Browser Voice',
  ttsEnabled: true,
  cameraEnabled: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('interview_ace_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [canvasMode, setCanvasMode] = useState<CanvasMode>('Constellations Network');

  useEffect(() => {
    localStorage.setItem('interview_ace_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      canvasMode,
      setCanvasMode,
      updateSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
