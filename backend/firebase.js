const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

// We'll initialize it if the file exists. 
// Otherwise we'll export null so the app doesn't crash before the user adds the key.
let firebaseAuth = null;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  firebaseAuth = getAuth(app);
  console.log('Firebase Admin initialized successfully.');
} else {
  console.warn('WARNING: serviceAccountKey.json not found. Firebase Admin is NOT initialized.');
}

module.exports = firebaseAuth;
