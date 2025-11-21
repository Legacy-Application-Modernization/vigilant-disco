import { Request, Response, NextFunction } from 'express';
import FirebaseConfig from '../config/firebase';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = req.cookies?.authToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          error: 'UNAUTHORIZED'
        });
        return;
      }
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
        error: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    // Verify the Firebase ID token
    const firebase = FirebaseConfig.getInstance();
    const decodedToken = await firebase.getAuth().verifyIdToken(token);
    
    // Attach user info to request (fixed - no duplicate uid)
    req.user = {
      ...decodedToken, // This already includes uid, email, etc.
      // Add any additional properties if needed
    };

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    let message = 'Invalid or expired token';
    let errorCode = 'INVALID_TOKEN';
    
    if (error.code === 'auth/id-token-expired') {
      message = 'Token has expired';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.code === 'auth/argument-error') {
      message = 'Invalid token format';
      errorCode = 'INVALID_TOKEN_FORMAT';
    }
    
    res.status(401).json({
      success: false,
      message,
      error: errorCode
    });
  }
};

// Optional middleware - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    const firebase = FirebaseConfig.getInstance();
    const decodedToken = await firebase.getAuth().verifyIdToken(token);
    
    req.user = {
      ...decodedToken
    };

    next();
  } catch (error) {
    // Just continue without authentication for optional auth
    next();
  }
};

export type { AuthenticatedRequest };