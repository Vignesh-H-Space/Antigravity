const fs = require('fs');
const path = require('path');

const webappDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(webappDir).filter(f => f.endsWith('.html'));

console.log('Found HTML files:', htmlFiles);

htmlFiles.forEach(file => {
  const filePath = path.join(webappDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Inject focus_engine.js before app.js if not already present
  if (content.includes('js/app.js') && !content.includes('js/focus_engine.js')) {
    content = content.replace(
      /([ \t]*<script\s+src="js\/app\.js"><\/script>)/,
      '  <script src="js/focus_engine.js"></script>\n$1'
    );
    changed = true;
    console.log(`Injected focus_engine.js into ${file}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('HTML files update complete.');
