const crypto = require('crypto');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Generate a new Moxie API Key
 * Format: moxie-XXXX-XXXX-XXXX-XXXX
 */
function generateRawKey() {
  const bytes = crypto.randomBytes(16).toString('hex');
  const chunks = bytes.match(/.{1,4}/g);
  return `moxie-${chunks.join('-')}`;
}

/**
 * Hash the key using SHA-256
 */
function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create and store the key
 */
async function generateAndStoreKey(userId) {
  if (!userId) {
    console.error('Usage: node generate-key.js <userId>');
    process.exit(1);
  }

  const rawKey = generateRawKey();
  const hashedKey = hashKey(rawKey);

  console.log('-------------------------------------------');
  console.log('🚀 Generating new Moxie API Key...');
  console.log('👤 User ID:', userId);
  console.log('🔑 Raw Key (SAVE THIS!):', rawKey);
  console.log('🔒 Hashed Key (stored in DB):', hashedKey);
  console.log('-------------------------------------------');

  try {
    await set(ref(db, `api_keys/${hashedKey}`), {
      userId: userId,
      createdAt: Date.now(),
      active: true,
      lastUsed: null,
    });
    console.log('✅ Success: API Key stored in Firebase.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error storing key:', error.message);
    process.exit(1);
  }
}

const userId = process.argv[2];
generateAndStoreKey(userId);
