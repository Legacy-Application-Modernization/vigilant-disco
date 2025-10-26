import { Router, Request, Response } from 'express';
import FirebaseConfig from '../config/firebase';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'LegacyModernize API is running - Firebase Free Tier',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    tier: 'free',
    uptime: `${Math.round(process.uptime())} seconds`
  });
});

// Detailed health check with Firebase connection test
router.get('/detailed', async (req: Request, res: Response) => {
  const healthCheck = {
    uptime: `${Math.round(process.uptime())} seconds`,
    message: 'OK',
    timestamp: new Date().toISOString(),
    tier: 'Firebase Free Tier',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: {
        status: 'OK',
        message: 'Server is running'
      },
      firebase: {
        status: 'Unknown',
        message: ''
      }
    }
  };

  try {
    // Test Firebase connection
    const firebase = FirebaseConfig.getInstance();
    const firestore = firebase.getFirestore();
    
    // Simple test query - this will create the collection if it doesn't exist
    await firestore.collection('health_check').limit(1).get();
    healthCheck.checks.firebase.status = 'OK';
    healthCheck.checks.firebase.message = 'Connected to Firestore successfully';
  } catch (error: any) {
    healthCheck.checks.firebase.status = 'ERROR';
    healthCheck.checks.firebase.message = error.message || 'Firebase connection failed';
    healthCheck.message = 'Degraded - Firebase connection issues';
  }

  const statusCode = healthCheck.message.startsWith('OK') ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const firebase = FirebaseConfig.getInstance();
    const firestore = firebase.getFirestore();
    await firestore.collection('health_check').limit(1).get();
    
    res.status(200).json({
      status: 'ready',
      tier: 'firebase-free',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: 'Firebase connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    tier: 'firebase-free',
    timestamp: new Date().toISOString()
  });
});

export default router;