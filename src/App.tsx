import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { DataProvider } from './context/DataContext';

import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { PracticeConfigPage } from './pages/PracticeConfigPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="practice" element={<PracticeConfigPage />} />
        <Route path="interview" element={<LiveInterviewPage />} />
        <Route path="evaluation" element={<EvaluationPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <DataProvider>
          <Router>
            <AppRoutes />
          </Router>
        </DataProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
