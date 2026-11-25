const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sourceDir = path.join(root, 'assets', 'audio');
const targetDir = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'audio');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`No ${src} — skip audio copy.`);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!['.m4a', '.mp3', '.aac', '.wav'].includes(ext)) continue;
    fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
    copied += 1;
  }
  return copied;
}

const androidRoot = path.join(root, 'android');
if (!fs.existsSync(androidRoot)) {
  console.log('android/ not found — run prebuild first, or copy assets/audio manually before release build.');
  process.exit(0);
}

const count = copyDir(sourceDir, targetDir);
console.log(`Bundled ${count} audio file(s) into android/app/src/main/assets/audio`);