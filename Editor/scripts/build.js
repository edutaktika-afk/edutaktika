#!/usr/bin/env node

/**
 * Build Script for Edutaktika Editor
 * Handles building for different environments (local vs deployed)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  // Copy additional files if needed
  if (env === 'deployed') {
    console.log('📋 Copying additional files for deployment...');
    
    // Ensure the deploy directory exists
    const deployDir = path.dirname(config.outDir);
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    // Copy any additional deployment files
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
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
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
