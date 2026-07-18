const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules/@expo/metro-file-map/build/watchers/FallbackWatcher.js');
const marker = '/node_modules|\\.git/.test(dir)';

let content = fs.readFileSync(file, 'utf8');

if (!content.includes(marker)) {
  content = content.replace(
    '#watchdir = (dir) => {',
    '#watchdir = (dir) => {\n    if (/node_modules|\\.git/.test(dir)) { return false; }'
  );
  fs.writeFileSync(file, content);
  console.log('✔ Patch FallbackWatcher.js appliqué');
} else {
  console.log('✔ Patch FallbackWatcher.js déjà présent');
}