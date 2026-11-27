const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const destDir = path.join(baseDir, 'node_modules', '@next', 'swc-wasm-nodejs');
const tgzPath = path.join(baseDir, 'wasm.tgz');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Downloading @next/swc-wasm-nodejs...');
const file = fs.createWriteStream(tgzPath);
https.get('https://registry.npmjs.org/@next/swc-wasm-nodejs/-/swc-wasm-nodejs-14.2.18.tgz', (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download complete. Extracting...');
      execSync(`tar -xzf "${tgzPath}" -C "${destDir}" --strip-components=1`, { stdio: 'inherit' });
      fs.unlinkSync(tgzPath);
      console.log('WASM SWC successfully installed!');
    });
  });
}).on('error', (err) => {
  console.error('Error downloading:', err);
});

