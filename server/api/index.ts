import type { VercelRequest, VercelResponse } from '@vercel/node';
import App from '../src/app';

// Initialize the app once
const appInstance = new App();
const app = appInstance.app;

// Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://vigilant-disco-client.vercel.app',
    'https://legacymodernize.vercel.app',
  ];

  console.log('🔍 Vercel Handler - Method:', req.method, 'Origin:', origin, 'Path:', req.url);

  // CRITICAL: Set CORS headers BEFORE any other processing
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    console.log('✅ Setting CORS headers for origin:', origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '600');
  } else {
    console.log('❌ Origin not allowed:', origin);
  }

  // Handle OPTIONS preflight immediately - don't pass to Express
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight - returning 204');
    res.writeHead(204, {
      'Content-Length': '0'
    });
    res.end();
    return;
  }

  // Pass to Express app for all other requests
  console.log('📤 Passing to Express app');
  app(req as any, res as any);
}
