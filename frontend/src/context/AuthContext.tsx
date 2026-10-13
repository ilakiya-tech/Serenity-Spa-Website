import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../services/serenityService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('serenity_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('serenity_token'));

  useEffect(() => {
    if (token && !user) {
      authApi.getCurrentUser()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('serenity_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({ email, password });
    const { token, id, fullName, role } = res.data;
    const userData: User = { id, fullName, email: res.data.email, role };
    setToken(token);
    setUser(userData);
    localStorage.setItem('serenity_token', token);
    localStorage.setItem('serenity_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (fullName: string, email: string, password: string, confirmPassword?: string) => {
    const res = await authApi.register({ fullName, email, password, confirmPassword });
    const { token, id, role } = res.data;
    const userData: User = { id, fullName, email: res.data.email, role };
    setToken(token);
    setUser(userData);
    localStorage.setItem('serenity_token', token);
    localStorage.setItem('serenity_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('serenity_token');
    localStorage.removeItem('serenity_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ROLE_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
