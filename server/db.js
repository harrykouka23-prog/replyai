import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'users.json');

function read() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email) {
  return read().users.find(u => u.email === email.toLowerCase()) ?? null;
}

export function findUserById(id) {
  return read().users.find(u => u.id === id) ?? null;
}

export function createUser({ id, email, passwordHash, name, credits }) {
  const db = read();
  const user = { id, email: email.toLowerCase(), passwordHash, name, credits, createdAt: new Date().toISOString() };
  db.users.push(user);
  write(db);
  return user;
}

export function updateUserCredits(id, credits) {
  const db = read();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx !== -1) { db.users[idx].credits = credits; write(db); }
}
