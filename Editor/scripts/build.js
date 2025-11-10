#!/usr/bin/env node

/**
 * Build Script for Edutaktika Editor
 * Handles building for different environments (local vs deployed)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Environment configuration
const environments = {
  local: {
    name: 'Local Development',
    outDir: './dist',
    base: './',
    sourcemap: true,
    analyze: false
  },
  deployed: {
    name: 'Deployed Production',
    outDir: '../deploy/editor',
    base: './',
    sourcemap: false,
    analyze: false
  },
  analyze: {
    name: 'Bundle Analysis',
    outDir: '../deploy/editor',
    base: './',
    sourcemap: true,
    analyze: true
  }
};

// Get environment from command line arguments
const env = process.argv[2] || 'deployed';
const config = environments[env];

if (!config) {
  console.error(`❌ Unknown environment: ${env}`);
  console.log('Available environments: local, deployed, analyze');
  process.exit(1);
}

console.log(`🚀 Building Edutaktika Editor for ${config.name}...`);

// Set environment variables
process.env.NODE_ENV = env === 'local' ? 'development' : 'production';
process.env.SOURCEMAP = config.sourcemap ? 'true' : 'false';
process.env.ANALYZE = config.analyze ? 'true' : 'false';

try {
  // Clean previous build
  if (fs.existsSync(config.outDir)) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync(config.outDir, { recursive: true, force: true });
  }

  // Run Vite build
  console.log('📦 Building with Vite...');
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // For deployed builds, copy everything from dist to deploy/editor
  if (env === 'deployed') {
    console.log('📋 Copying build output to deployment directory...');
    
    const distDir = path.join(process.cwd(), 'dist');
    const deployDir = config.outDir;
    
    // Ensure deploy directory exists
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    // Copy all files from dist to deploy/editor
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      files.forEach(file => {
        const srcPath = path.join(distDir, file);
        const destPath = path.join(deployDir, file);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
          // Recursively copy directories
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          copyRecursiveSync(srcPath, destPath);
        } else {
          // Copy files
          fs.copyFileSync(srcPath, destPath);
        }
      });
      console.log('✅ Build output copied to deployment directory');
    }
  }

  // Copy additional files if needed
  if (env === 'deployed') {
    console.log('📋 Copying additional files for deployment...');
    
    // Ensure the deploy directory exists
    const deployDir = path.dirname(config.outDir);
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    // Copy any additional deployment files (vite should copy public files, but we ensure key files are there)
    const additionalFiles = [
      'public/manifest.json',
      'public/favicon.ico',
      'public/icon@2x.png',
      'public/logo.png'
    ];
    
    additionalFiles.forEach(file => {
      const srcPath = path.join(process.cwd(), file);
      const destPath = path.join(config.outDir, path.basename(file));
      
      if (fs.existsSync(srcPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ Copied ${file}`);
        } catch (err) {
          console.warn(`⚠️  Could not copy ${file}: ${err.message}`);
        }
      } else {
        // Try from dist folder (vite may have already copied it)
        const distPath = path.join(process.cwd(), 'dist', path.basename(file));
        if (fs.existsSync(distPath)) {
          try {
            fs.copyFileSync(distPath, destPath);
            console.log(`✅ Copied ${file} from dist`);
          } catch (err) {
            console.warn(`⚠️  Could not copy ${file} from dist: ${err.message}`);
          }
        } else {
          console.warn(`⚠️  File not found: ${file}`);
        }
      }
    });
  }

  console.log(`✅ Build completed successfully for ${config.name}!`);
  console.log(`📁 Output directory: ${config.outDir}`);
  
  if (config.analyze) {
    console.log('📊 Bundle analysis available in the browser');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
