import type { VercelRequest, VercelResponse } from '@vercel/node';
import App from '../src/app';

// Initialize the app once
const appInstance = new App();
const app = appInstance.app;

// Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set permissive CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '600');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Content-Length': '0' });
    res.end();
    return;
  }

  // Pass to Express app
  app(req as any, res as any);
}
