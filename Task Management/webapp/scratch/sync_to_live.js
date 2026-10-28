const fs = require('fs');
const path = require('path');

const srcRoot = 'd:\\Antigravity\\Task Management';
const dstRoot = 'D:\\Task Management Application\\Task-Management-Application';

const srcWebapp = path.join(srcRoot, 'webapp');
const dstWebapp = path.join(dstRoot, 'webapp');

function copyDirRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    // Skip scratch directory and backup files
    if (entry.name === 'scratch' || entry.name.endsWith('.bak')) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, dstPath);
      const stat = fs.statSync(dstPath);
      console.log(`Copied: ${path.relative(dstWebapp, dstPath)} (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('SYNCING TO LIVE REPOSITORY: Task-Management-Application');
console.log('Source:     ', srcWebapp);
console.log('Destination:', dstWebapp);
console.log('═══════════════════════════════════════════════════════════');

copyDirRecursive(srcWebapp, dstWebapp);

console.log('\nCopy completed successfully!');
