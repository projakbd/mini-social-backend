const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
['icon.png', 'splash-icon.png', 'adaptive-icon.png'].forEach((f) => {
  fs.writeFileSync(path.join(dir, f), png);
});
console.log('Created assets/icon.png, splash-icon.png, adaptive-icon.png');
