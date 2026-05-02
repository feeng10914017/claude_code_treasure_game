import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getUserScores, ScoreRecord } from '../db/database';
import { Button } from './ui/button';

interface Props {
  userId: number;
  onClose: () => void;
}

export default function ScoreHistoryModal({ userId, onClose }: Props) {
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  useEffect(() => {
    setScores(getUserScores(userId));
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-50 rounded-xl shadow-xl border-2 border-amber-400 p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-amber-900">📊 歷史分數（最近 10 局）</h2>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-900 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {scores.length === 0 ? (
          <p className="text-amber-700 text-center py-8">還沒有任何遊戲記錄</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {scores.map((s, i) => (
              <div
                key={i}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  s.score > 0
                    ? 'bg-green-50 border-green-200'
                    : s.score === 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="text-amber-700 text-sm">
                  {new Date(s.created_at).toLocaleString('zh-TW')}
                </span>
                <span className={`font-bold text-lg ${
                  s.score > 0 ? 'text-green-600' : s.score === 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {s.score >= 0 ? '+' : ''}${s.score}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
        >
          關閉
        </Button>
      </motion.div>
    </div>
  );
}
