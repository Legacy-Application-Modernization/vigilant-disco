// api/index.ts  ← THIS IS THE ONLY FILE VERCEL WILL RUN
import App from '../src/app'; // Adjust path if your App.ts is in src/

// Create the Express app instance
const appInstance = new App();

// Export the raw Express app (NO .listen() EVER!)
export default appInstance.getApp();