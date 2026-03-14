// Run this from E:\TradingMonitor\ after copying the SVG files to assets/
// It uses sharp which is already installed in most Expo projects
// Run: node convert_icons.js

const fs = require('fs');
const path = require('path');

// If sharp is not installed: npm install sharp
let sharp;
try {
  sharp = require('sharp');
} catch(e) {
  console.log('Installing sharp...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
  sharp = require('sharp');
}

const assetsDir = path.join(__dirname, 'assets');

async function convert() {
  console.log('Converting icons...');

  // icon.png — 1024x1024
  await sharp(path.join(assetsDir, 'icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log(' icon.png (1024x1024)');

  // adaptive-icon.png — 1024x1024
  await sharp(path.join(assetsDir, 'adaptive-icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log(' adaptive-icon.png (1024x1024)');

  // splash.png — 1284x2778 (iPhone 14 Pro Max)
  await sharp(path.join(assetsDir, 'icon.svg'))
    .resize(1284, 2778, { fit: 'contain', background: { r: 10, g: 14, b: 26 } })
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('splash.png (1284x2778)');

  // favicon.png — 48x48
  await sharp(path.join(assetsDir, 'icon.svg'))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log(' favicon.png (48x48)');

  console.log('\n All icons converted! Now run: eas build --platform android --profile production');
}

convert().catch(console.error);