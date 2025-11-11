#!/usr/bin/env node
/**
 * build-all.js
 * Creates a unified deploy/ folder containing:
 * - Root index.html and other top-level html (except those you exclude manually)
 * - Key folders (Admin, Student, Teacher, Games, images, CSS, assets, Bin if needed)
 * - Built Vite Editor under deploy/editor/
 * Excludes: EXAMPLES/ folder entirely.
 */
const { execSync } = require('child_process');
const { rmSync, mkdirSync, cpSync, existsSync, readdirSync, lstatSync, statSync, readFileSync, writeFileSync, copyFileSync } = require('fs');
const { join } = require('path');

const root = process.cwd();
const deployDir = join(root, 'deploy');

function log(msg){ console.log('[build-all]', msg); }

function safeCopyFile(src, dest) {
  try {
    copyFileSync(src, dest);
  } catch (e) {
    log('FILE COPY SKIPPED (' + e.code + '): ' + src);
  }
}

function copyRecursive(src, dest) {
  if (!existsSync(src)) { log('skip (missing): ' + src); return; }
  try {
    if (lstatSync(src).isDirectory()) {
      mkdirSync(dest, { recursive: true });
      const entries = readdirSync(src);
      for (const entry of entries) {
        const s = join(src, entry);
        const d = join(dest, entry);
        try {
          if (lstatSync(s).isDirectory()) {
            copyRecursive(s, d);
          } else {
            safeCopyFile(s, d);
          }
        } catch (innerErr) {
          log('SKIP entry (' + innerErr.code + '): ' + s);
        }
      }
    } else {
      safeCopyFile(src, dest);
    }
  } catch (err) {
    log('SKIP path (' + err.code + '): ' + src);
  }
}

// 1. Clean deploy dir
if (existsSync(deployDir)) {
  rmSync(deployDir, { recursive: true, force: true });
}
mkdirSync(deployDir);
log('Created deploy/');

// 2. Copy root html files we want (exclude anything you don't want public manually)
readdirSync(root)
  .filter(f => f.toLowerCase().endsWith('.html'))
  .forEach(f => {
    cpSync(join(root, f), join(deployDir, f));
    log('Copied root HTML: ' + f);
  });

// 3. Folders to include
const includeFolders = [
  'Admin',
  'Student',
  'Teacher',
  'Games',
  'images',
  'CSS',
  'assets',
  'Bin' // remove if not needed
];

includeFolders.forEach(folder => {
  const src = join(root, folder);
  if (existsSync(src)) {
    copyRecursive(src, join(deployDir, folder));
    log('Copied folder (recursive): ' + folder);
  }
});

// 4. Copy supporting files
['robots.txt', 'DISCLAIMER.md', 'README.md'].forEach(file => {
  if (existsSync(join(root, file))) {
    cpSync(join(root, file), join(deployDir, file));
    log('Copied file: ' + file);
  }
});

// 4.5. Copy Polotno helper files to assets/js/
const polotnoHelpers = ['uploadPolotno.js', 'loadPolotnoDesign.js'];
const assetsJsDir = join(deployDir, 'assets', 'js');
mkdirSync(assetsJsDir, { recursive: true });
polotnoHelpers.forEach(file => {
  const src = join(root, file);
  if (existsSync(src)) {
    cpSync(src, join(assetsJsDir, file));
    log('Copied Polotno helper: ' + file + ' -> assets/js/');
  } else {
    log('WARNING: Polotno helper not found: ' + file);
  }
});

// 5. Build Vite editor
const editorDir = join(root, 'Editor');
if (existsSync(editorDir)) {
  log('Installing deps in Editor/ (if already installed this is quick)...');
  execSync('npm install', { cwd: editorDir, stdio: 'inherit' });
  log('Building Editor/...');
  execSync('npm run build', { cwd: editorDir, stdio: 'inherit' });
  const dist = join(editorDir, 'dist');
  if (existsSync(dist)) {
    // Copy contents of dist into deploy/editor (flatten, not nest dist)
    const editorTargetLower = join(deployDir, 'editor');
    mkdirSync(editorTargetLower, { recursive: true });
    readdirSync(dist).forEach(entry => {
      const s = join(dist, entry);
      const d = join(editorTargetLower, entry);
      copyRecursive(s, d);
    });
    log('Copied editor build contents into deploy/editor/');

    // Duplicate full dist (including its structure) under /Editor/dist for case-sensitive references
    const editorTargetCapDist = join(deployDir, 'Editor', 'dist');
    mkdirSync(editorTargetCapDist, { recursive: true });
    readdirSync(dist).forEach(entry => {
      const s = join(dist, entry);
      const d = join(editorTargetCapDist, entry);
      copyRecursive(s, d);
    });
    log('Copied editor build contents into deploy/Editor/dist/');
  } else {
    log('WARNING: Editor/dist not found after build.');
  }
}

// 6. Explicitly ensure EXAMPLES not copied
if (existsSync(join(deployDir, 'EXAMPLES'))) {
  rmSync(join(deployDir, 'EXAMPLES'), { recursive: true, force: true });
  log('Removed EXAMPLES from deploy.');
}

// 7. Optional: list deploy structure summary
function list(dir, prefix='') {
  readdirSync(dir).forEach(name => {
    const p = join(dir, name);
    const rel = p.replace(root+require('path').sep, '');
    if (lstatSync(p).isDirectory()) {
      log('DIR  ' + rel + '/');
      list(p, prefix + '  ');
    } else {
      log('FILE ' + rel);
    }
  });
}
log('Build complete. Deploy folder contents:');
list(deployDir);
