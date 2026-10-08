import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialUsers';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password?: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  loginWithGoogleAccount: (email: string, name?: string, picture?: string) => boolean;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('interview_ace_users');
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      // Remove any pre-existing olpulashok56@gmail.com so user can recreate it fresh
      const filtered = parsed.filter(u => u.email.toLowerCase() !== 'olpulashok56@gmail.com');
      return filtered.map(u => ({ ...u, password: u.password || 'password123' }));
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('interview_ace_current_user');
    if (saved) {
      const parsed: User = JSON.parse(saved);
      if (parsed.email.toLowerCase() === 'olpulashok56@gmail.com') {
        return null;
      }
      return parsed;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('interview_ace_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('interview_ace_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('interview_ace_current_user');
    }
  }, [currentUser]);

  const login = (identifier: string, password?: string): AuthResult => {
    const cleanId = identifier.trim().toLowerCase();

    const existing = users.find(
      u => u.email.toLowerCase() === cleanId || (u.name && u.name.toLowerCase() === cleanId) || u.id === cleanId
    );

    if (!existing) {
      return { success: false, message: 'Account not found with this email address or username. Please register.' };
    }

    const expectedPass = existing.password || 'password123';

    if (password !== undefined && password !== '' && expectedPass !== password) {
      return { success: false, message: 'Incorrect password. Access denied.' };
    }

    setCurrentUser(existing);
    return { success: true };
  };

  const register = (name: string, email: string, password: string): AuthResult => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Assign ADMIN role if email is olpulashok56@gmail.com, otherwise USER
    const role: UserRole = cleanEmail === 'olpulashok56@gmail.com' ? 'ADMIN' : 'USER';

    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      role,
      createdDate: new Date().toLocaleDateString('en-US')
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const loginWithGoogleAccount = (email: string, name?: string, picture?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    let existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      const role: UserRole = cleanEmail === 'olpulashok56@gmail.com' ? 'ADMIN' : 'USER';
      existing = {
        id: `u_g_${Date.now()}`,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: 'google_authenticated',
        role,
        createdDate: new Date().toLocaleDateString('en-US')
      };
      setUsers(prev => [...prev, existing!]);
    }
    setCurrentUser(existing);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login,
      register,
      loginWithGoogleAccount,
      logout,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
