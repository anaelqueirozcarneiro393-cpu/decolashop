const fs = require('fs');
const path = require('path');

const dump = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_db_dump.json'), 'utf-8'));
const users = dump.tables.users;

const emails = users.map(u => (u.email || '').toLowerCase().trim());
console.log('Total user records:', users.length);

const decolashop = emails.filter(e => e.endsWith('@decolashop.com'));
console.log('Decolashop internal/test emails:', decolashop.length);

const aleghartz = emails.filter(e => e.includes('aleghartz') || e.includes('digital405060'));
console.log('Admin test emails:', aleghartz.length);

const otherDups = {};
emails.forEach(e => {
  otherDups[e] = (otherDups[e] || 0) + 1;
});
const duplicates = Object.entries(otherDups).filter(([k, v]) => v > 1);
console.log('Duplicates count:', duplicates.length, duplicates);

const validClients = new Set();
users.forEach(u => {
  const e = (u.email || '').toLowerCase().trim();
  if (e && !e.endsWith('@decolashop.com') && !['aleghartz@gmail.com', 'digital405060@gmail.com'].includes(e)) {
    validClients.add(e);
  }
});
console.log('Unique valid clients:', validClients.size);
