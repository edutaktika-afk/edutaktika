#!/usr/bin/env node

/**
 * Firebase Rules and Indexes Deployment Script
 * 
 * This script deploys Firebase Realtime Database rules and Firestore indexes
 * to improve query performance for the Edutaktika assessment system.
 * 
 * Usage:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize project: firebase init
 * 4. Run this script: node deploy-firebase-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firebase Rules and Indexes for Edutaktika...\n');

// Check if Firebase CLI is installed
try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI found');
} catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('   npm install -g firebase-tools');
    process.exit(1);
}

// Check if user is logged in
try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase authentication verified');
} catch (error) {
    console.error('❌ Not logged in to Firebase. Please run:');
    console.error('   firebase login');
    process.exit(1);
}

// Deploy Realtime Database rules
console.log('\n📋 Deploying Realtime Database rules...');
try {
    if (fs.existsSync('database.rules.json')) {
        execSync('firebase deploy --only database', { stdio: 'inherit' });
        console.log('✅ Realtime Database rules deployed successfully');
    } else {
        console.log('⚠️  database.rules.json not found, skipping...');
    }
} catch (error) {
    console.error('❌ Failed to deploy Realtime Database rules:', error.message);
}

// Deploy Firestore rules
console.log('\n🔥 Deploying Firestore rules...');
try {
    if (fs.existsSync('firestore.rules')) {
        execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
        console.log('✅ Firestore rules deployed successfully');
    } else {
        console.log('⚠️  firestore.rules not found, skipping...');
    }
} catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error.message);
}

// Deploy Firestore indexes
console.log('\n📊 Deploying Firestore indexes...');
try {
    if (fs.existsSync('firestore.indexes.json')) {
        execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
        console.log('✅ Firestore indexes deployed successfully');
    } else {
        console.log('⚠️  firestore.indexes.json not found, skipping...');
    }
} catch (error) {
    console.error('❌ Failed to deploy Firestore indexes:', error.message);
}

console.log('\n🎉 Firebase deployment completed!');
console.log('\n📝 Next steps:');
console.log('1. The indexes may take a few minutes to build');
console.log('2. Monitor the Firebase Console for index build status');
console.log('3. Test your queries to ensure they use the new indexes');
console.log('\n🔗 Firebase Console: https://console.firebase.google.com/');

// Display the rules that were deployed
console.log('\n📋 Deployed Rules Summary:');
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ Realtime Database Indexes:                                 │');
console.log('│ • assessments: subject, status, createdBy, gradeLevel      │');
console.log('│ • assessmentAttempts: assessmentId, studentId, timestamp   │');
console.log('│ • students: role, grade, subject                           │');
console.log('│ • teachers: role, subject, status                          │');
console.log('│ • admins: role, status                                     │');
console.log('│ • quizSummaries: lessonId, studentId                       │');
console.log('│ • assessmentSummaries: assessmentId, studentId             │');
console.log('└─────────────────────────────────────────────────────────────┘');
