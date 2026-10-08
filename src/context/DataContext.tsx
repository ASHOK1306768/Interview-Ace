import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, CategoryTrack, InterviewSession } from '../types';
import { INITIAL_QUESTIONS, generateQuestionPool } from '../data/questionBankData';

interface DataContextType {
  questions: Question[];
  sessions: InterviewSession[];
  addQuestion: (question: Omit<Question, 'id'>) => void;
  deleteQuestion: (id: number) => void;
  addSession: (session: InterviewSession) => void;
  deleteSession: (id: string) => void;
  restoreDefaultQuestions: () => void;
  getQuestionsByCategory: (category: CategoryTrack) => Question[];
}

const INITIAL_SESSIONS: InterviewSession[] = [
  {
    id: 's_101',
    candidateName: 'Ashok Ashok',
    candidateEmail: 'olpulashok56@gmail.com',
    targetTrack: 'Coding Problems',
    experienceLevel: 'Entry-Level (0-2 years)',
    durationSeconds: 21,
    score: 0,
    verdict: 'Requires Practice',
    completedDate: '11/08/2026',
    evaluations: [
      {
        questionId: 1,
        questionTitle: 'Write a function to check if a string is a palindrome. What is the time and space complexity?',
        userAnswer: '(No answer provided)',
        speechContentEval: 'You did not provide an answer. In a real interview, remaining silent is highly detrimental. Even if unsure, try to explain your thought process or ask clarifying questions.',
        recommendedAnswerStructure: 'Use a two-pointer approach comparing left and right indices until they meet. Time Complexity: O(N), Space Complexity: O(1).'
      }
    ]
  },
  {
    id: 's_102',
    candidateName: 'Ashok Ashok',
    candidateEmail: 'olpulashok56@gmail.com',
    targetTrack: 'Backend Developer',
    experienceLevel: 'Entry-Level (0-2 years)',
    durationSeconds: 29,
    score: 0,
    verdict: 'Requires Practice',
    completedDate: '05/08/2026',
    isTailored: true,
    evaluations: []
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('interview_ace_questions');
    if (saved) return JSON.parse(saved);
    return INITIAL_QUESTIONS;
  });

  const [sessions, setSessions] = useState<InterviewSession[]>(() => {
    const saved = localStorage.getItem('interview_ace_sessions');
    if (saved) return JSON.parse(saved);
    return INITIAL_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('interview_ace_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('interview_ace_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addQuestion = (newQ: Omit<Question, 'id'>) => {
    const nextId = Math.max(...questions.map(q => q.id), 0) + 1;
    setQuestions(prev => [{ ...newQ, id: nextId }, ...prev]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addSession = (session: InterviewSession) => {
    setSessions(prev => [session, ...prev]);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const restoreDefaultQuestions = () => {
    setQuestions(INITIAL_QUESTIONS);
  };

  const getQuestionsByCategory = (category: CategoryTrack): Question[] => {
    const matched = questions.filter(q => q.category === category);
    if (matched.length >= 100) return matched;
    return generateQuestionPool(category);
  };

  return (
    <DataContext.Provider value={{
      questions,
      sessions,
      addQuestion,
      deleteQuestion,
      addSession,
      deleteSession,
      restoreDefaultQuestions,
      getQuestionsByCategory
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
