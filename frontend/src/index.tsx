import { serve } from "bun";
import index from "./index.html";

const API_BASE_URL = Bun.env.API_BASE_URL || 'http://localhost:3001/api';

const server = serve({
  hostname: '0.0.0.0', // Bind to all interfaces for Docker compatibility
  port: process.env.PORT || 3000, // Use PORT environment variable or default to 3000
  routes: {
    // Serve the API configuration to the browser
    "/config.json": async req => {
      return Response.json({
        API_BASE_URL: API_BASE_URL
      });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`📡 Browser will make API calls to: ${API_BASE_URL}`);
