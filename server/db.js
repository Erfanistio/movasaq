import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { seed } from './seed.js';
mkdirSync('data', {recursive:true});
export const db = new DatabaseSync(process.env.DB_PATH || 'data/movasaq.sqlite');
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS content (kind TEXT NOT NULL,id TEXT NOT NULL,value TEXT NOT NULL,PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY,kind TEXT NOT NULL,value TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'جدید',created TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS certificates (id TEXT PRIMARY KEY,name TEXT NOT NULL,course TEXT NOT NULL,date TEXT NOT NULL); CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
if (!db.prepare("SELECT 1 FROM config WHERE key='seeded'").get()) {
 for (const [kind,items] of Object.entries(seed)) {
  for (const item of kind==='settings' ? [{id:'main',...items}] : items) db.prepare('INSERT INTO content VALUES (?,?,?)').run(kind,item.id,JSON.stringify(item));
 }
 db.prepare('INSERT INTO config VALUES (?,?)').run('seeded','1');
}
export function content(publicOnly=false) {
 const result={settings:{},services:[],products:[],courses:[],posts:[],pages:[],gallery:[],licenses:[]};
 for(const row of db.prepare('SELECT * FROM content ORDER BY rowid').all()) { const value=JSON.parse(row.value); if(row.kind==='settings')result.settings=value; else if(!publicOnly||value.published)result[row.kind]?.push(value); }
 return result;
}
