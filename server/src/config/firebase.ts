import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private initialized = false;

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔧 Initializing Firebase Admin SDK...');
      
      // Check if environment variables are set
      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error('FIREBASE_PROJECT_ID is not set in environment variables');
      }
      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('FIREBASE_CLIENT_EMAIL is not set in environment variables');
      }
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
      }

      console.log('📋 Environment variables found:');
      console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`   Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
      console.log(`   Private Key: ${process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET'}`);

      // Initialize Firebase Admin SDK (Free Tier - Firestore only)
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully (Free Tier)');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:');
      console.error('Error message:', error);
      throw error;
    }
  }

  public getFirestore() {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return getFirestore();
  }

  public getAuth() {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return admin.auth();
  }
}

export default FirebaseConfig;