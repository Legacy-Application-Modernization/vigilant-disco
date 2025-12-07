import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import configuration and middleware
import FirebaseConfig from './config/firebase';
import routes from './routes/index';
import { errorHandler } from './middleware/error';

// Load environment variables
dotenv.config();

class App {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    
    this.initializeFirebase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeFirebase(): void {
    try {
      const firebase = FirebaseConfig.getInstance();
      firebase.initialize();
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      // Don't exit in serverless environments (Vercel)
      if (process.env.VERCEL !== '1') {
        process.exit(1);
      }
    }
  }

  private initializeMiddleware(): void {
    // CORS disabled - handled in Vercel serverless handler (api/index.ts)

    // Security middleware - DISABLE crossOriginResourcePolicy to not interfere with CORS
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", "https://firestore.googleapis.com"]
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false
    }));

    // Compression middleware
    this.app.use(compression() as unknown as express.RequestHandler);

    // Cookie parser middleware
    this.app.use(cookieParser());

    // Body parsing middleware
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    });

    // Trust proxy
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Basic welcome route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to LegacyModernize API - Firebase Free Tier',
        version: '1.0.0',
        tier: 'free',
        features: [
          'User Authentication & Profiles',
          'Project Management',
          'Firebase Firestore Database',
          'RESTful API'
        ],
        endpoints: {
          health: '/health',
          api: '/api/v1'
        }
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'LegacyModernize API is running - Firebase Free Tier',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tier: 'free'
      });
    });

    // Test endpoint (no auth)
    this.app.get('/test', (req, res) => {
      res.json({
        success: true,
        message: 'Test endpoint working',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/v1', routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: 'NOT_FOUND',
        method: req.method,
        availableEndpoints: {
          root: '/',
          health: '/health',
          test: '/test',
          api: '/api/v1'
        }
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log('🚀 LegacyModernize API - Firebase Free Tier');
      console.log('');
      console.log('📊 Server Configuration:');
      console.log(`   Port: ${this.port}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log('');
      console.log('📡 Available Endpoints:');
      console.log(`   Root: http://localhost:${this.port}/`);
      console.log(`   Health Check: http://localhost:${this.port}/health`);
      console.log(`   Test: http://localhost:${this.port}/test`);
      console.log(`   API Base: http://localhost:${this.port}/api/v1`);
      console.log(`   Users: http://localhost:${this.port}/api/v1/users`);
      console.log(`   Projects: http://localhost:${this.port}/api/v1/projects`);
      console.log('');
      console.log('✅ Server is running successfully!');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default App;