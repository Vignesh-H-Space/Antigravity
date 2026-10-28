const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', 'css');
const modulesDir = path.join(cssDir, 'modules');
const stylesPath = path.join(cssDir, 'styles.css');

const moduleNames = [
  'variables.css',
  'base.css',
  'sidebar.css',
  'dashboard.css',
  'focus_mode.css',
  'engines.css',
  'matrix.css',
  'responsive_core.css',
  'report.css',
  'command_palette.css',
  'kanban.css',
  'analytics.css',
  'mobile_suite.css',
  'backlogs_docket.css',
  'pulse.css',
  'professional.css',
  'tracker.css',
  'themes_light.css'
];

// 1. Bundle all modules into css/styles.css
const bundledContent = moduleNames.map(name => {
  const filePath = path.join(modulesDir, name);
  return `/* ── MODULE: ${name} ── */\n` + fs.readFileSync(filePath, 'utf8');
}).join('\n\n');

fs.writeFileSync(stylesPath, bundledContent, 'utf8');
console.log(`Bundled ${moduleNames.length} modules into css/styles.css (${bundledContent.split('\n').length} lines).`);

// 2. Generate modular link tags for HTML files
const modularLinkTags = [
  '  <!-- Tesseract Executive Architecture — Modular Stylesheets -->',
  ...moduleNames.map(name => `  <link rel="stylesheet" href="css/modules/${name}">`)
].join('\n');

const webappDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(webappDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(webappDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<link rel="stylesheet" href="css/styles.css">')) {
    content = content.replace(
      '  <link rel="stylesheet" href="css/styles.css">',
      modularLinkTags
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated modular stylesheet links in ${file}`);
  }
});

console.log('All HTML files updated with direct modular links!');
