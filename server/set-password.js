import 'dotenv/config';
import { db } from './db.js';
import { passwordHash } from './auth.js';
const password=process.env.ADMIN_PASSWORD;
if(!password||password.length<12) { console.error('Set ADMIN_PASSWORD in .env to at least 12 characters.'); process.exit(1); }
db.prepare("INSERT OR REPLACE INTO config VALUES ('password',?)").run(passwordHash(password));
db.exec('DELETE FROM sessions');
console.log('Administrator password updated. All sessions revoked.');
