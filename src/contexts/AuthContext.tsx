import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initDatabase, User } from '../db/database';

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  isDbReady: boolean;
  dbError: string | null;
  login: (user: User) => void;
  enterGuestMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch(err => {
        console.error('DB init failed:', err);
        setDbError('資料庫初始化失敗，請重新整理頁面');
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isGuest,
      isDbReady,
      dbError,
      login: setUser,
      enterGuestMode: () => setIsGuest(true),
      logout: () => { setUser(null); setIsGuest(false); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
