import initSqlJs, { Database } from 'sql.js';

const STORAGE_KEY = 'treasure_game_db';
let db: Database | null = null;

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (f: string) => {
      console.log('[sql.js] locateFile requested:', f);
      return '/' + f;
    },
  });

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const buf = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    persist();
  }
}

function persist(): void {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...Array.from(data)));
  localStorage.setItem(STORAGE_KEY, base64);
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface User {
  id: number;
  username: string;
}

export async function registerUser(username: string, password: string): Promise<User> {
  if (!db) throw new Error('資料庫未初始化');
  const hash = await hashPassword(password);
  try {
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    persist();
  } catch (e) {
    if (String(e).includes('UNIQUE constraint failed')) throw new Error('用戶名已存在');
    throw e;
  }
  const result = db.exec('SELECT id, username FROM users WHERE username = ?', [username]);
  const row = result[0].values[0];
  return { id: row[0] as number, username: row[1] as string };
}

export async function loginUser(username: string, password: string): Promise<User> {
  if (!db) throw new Error('資料庫未初始化');
  const hash = await hashPassword(password);
  const result = db.exec(
    'SELECT id, username FROM users WHERE username = ? AND password_hash = ?',
    [username, hash]
  );
  if (!result.length || !result[0].values.length) throw new Error('用戶名或密碼錯誤');
  const row = result[0].values[0];
  return { id: row[0] as number, username: row[1] as string };
}

export function saveScore(userId: number, score: number): void {
  if (!db) return;
  db.run('INSERT INTO game_scores (user_id, score) VALUES (?, ?)', [userId, score]);
  persist();
}

export interface ScoreRecord {
  score: number;
  created_at: string;
}

export function getUserScores(userId: number): ScoreRecord[] {
  if (!db) return [];
  const result = db.exec(
    'SELECT score, created_at FROM game_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [userId]
  );
  if (!result.length) return [];
  return result[0].values.map(row => ({
    score: row[0] as number,
    created_at: row[1] as string,
  }));
}
