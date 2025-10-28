#!/usr/bin/env node

/**
 * Setup Script for Edutaktika Editor
 * Helps users get started with the enhanced features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Edutaktika Editor - Enhanced Features Setup');
console.log('==============================================\n');

// Check if we're in the Editor directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the Editor directory');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Create necessary directories
const dirs = ['scripts', 'src/utils', 'src/components'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

console.log('\n🚀 Available Commands:');
console.log('=====================');
console.log('npm run dev              - Start development server');
console.log('npm run build:local      - Build for local development');
console.log('npm run build:deployed   - Build for deployed production');
console.log('npm run build:analyze    - Build with bundle analysis');
console.log('npm run preview          - Preview the built application');

console.log('\n🎯 Key Features:');
console.log('================');
console.log('• Environment Detection - Automatically switches between local/deployed');
console.log('• Enhanced Animations   - Smooth transitions and professional effects');
console.log('• License Banner Hiding - Clean presentations without watermarks');
console.log('• Presentation Mode     - Fullscreen slideshow with enhanced UI');

console.log('\n📖 Documentation:');
console.log('==================');
console.log('• ENHANCED_FEATURES_GUIDE.md - Complete feature documentation');
console.log('• README.md - Basic setup and usage');

console.log('\n✨ Setup Complete!');
console.log('==================');
console.log('Your Edutaktika Editor is ready with enhanced features!');
console.log('Run "npm run dev" to start developing or "npm run build:deployed" to build for production.');
