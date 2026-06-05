const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || process.env.RENDER_EXTERNAL_URL || '';
const content = `window.__API_BASE__ = "${API_BASE}";`;
const out = path.resolve(__dirname, '..', 'public', 'env.js');
fs.writeFileSync(out, content, 'utf8');
console.log('Wrote', out, 'API_BASE=', API_BASE);
