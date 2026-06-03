import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  if (!fs.existsSync(src)) return;

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  copyRecursive(path.join(projectRoot, 'shell/dist'), path.join(projectRoot, 'tauri-dist'));
  copyRecursive(path.join(projectRoot, 'build/package/website'), path.join(projectRoot, 'tauri-dist/build/package/website'));
  copyRecursive(path.join(projectRoot, 'assets'), path.join(projectRoot, 'tauri-dist/assets'));
  console.log('Build artifacts copied successfully');
} catch (error) {
  console.error('Copy failed:', error);
  process.exit(1);
}
