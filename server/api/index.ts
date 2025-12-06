import serverless from 'serverless-http';
import App from '../src/app';

// Build the Express app using the existing class-based setup
const appInstance = new App();
const expressApp = appInstance.getApp ? appInstance.getApp() : appInstance.app;

// Wrap with serverless-http so all middleware and routes run on Vercel Functions
const handler = serverless(expressApp, {
	// Ensure OPTIONS preflight is handled for any route
	callbackWaitsForEmptyEventLoop: false,
});

export default handler;
