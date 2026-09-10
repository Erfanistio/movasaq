import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
export const hashToken = value => createHash('sha256').update(value).digest('hex');
export function passwordHash(password) {const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function passwordMatches(password,hash) {if(!hash)return false;const [salt,key]=hash.split(':');return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(password,salt,64));}
