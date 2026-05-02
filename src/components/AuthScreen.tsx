import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { registerUser, loginUser } from '../db/database';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'signin' | 'signup';

export default function AuthScreen() {
  const { login, enterGuestMode } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('請輸入用戶名和密碼');
      return;
    }
    if (tab === 'signup' && password !== confirmPassword) {
      setError('兩次密碼輸入不一致');
      return;
    }
    if (tab === 'signup' && password.length < 4) {
      setError('密碼至少需要 4 個字元');
      return;
    }

    setLoading(true);
    try {
      const user = tab === 'signup'
        ? await registerUser(username.trim(), password)
        : await loginUser(username.trim(), password);
      login(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-700">登入以記錄你的分數</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400 p-8 w-full max-w-sm"
      >
        <div className="flex mb-6 bg-amber-100 rounded-lg p-1">
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              {t === 'signin' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-amber-800 mb-1">用戶名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="輸入用戶名"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-amber-800 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="輸入密碼"
              disabled={loading}
            />
          </div>

          {tab === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm text-amber-800 mb-1">確認密碼</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="再次輸入密碼"
                disabled={loading}
              />
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center bg-red-50 rounded-lg p-2"
            >
              {error}
            </motion.p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? '處理中...' : tab === 'signin' ? '登入' : '建立帳號'}
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-amber-300 text-center">
          <Button
            onClick={enterGuestMode}
            variant="outline"
            className="w-full border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            👤 以訪客身份遊玩
          </Button>
          <p className="text-xs text-amber-600 mt-2">訪客模式不會保存分數記錄</p>
        </div>
      </motion.div>
    </div>
  );
}
