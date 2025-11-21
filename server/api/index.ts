import App from '../src/app';

// Initialize the app
const appInstance = new App();

// Export the Express app for Vercel serverless
export default appInstance.app;
