const Database = require('D:/DevProject/ict/codearts-ai-basics-res/TREK/server/node_modules/better-sqlite3');
const db = new Database('D:/DevProject/ict/codearts-ai-basics-res/TREK/data/travel.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('tables:', tables.map(t => t.name).join(', '));
try {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  console.log('users columns:', cols.map(c => c.name).join(', '));
  const users = db.prepare('SELECT * FROM users LIMIT 5').all();
  console.log('users:', JSON.stringify(users, null, 2));
} catch(e) {
  console.log('query error:', e.message);
}