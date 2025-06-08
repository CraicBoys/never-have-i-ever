import { GameService } from './src/services/GameService.js';
import { WebSocketService } from './src/services/WebSocketService.js';

const gameService = new GameService();
const wsService = new WebSocketService(gameService);

// Clean up inactive games every 5 minutes
setInterval(() => {
  gameService.cleanupInactiveGames();
}, 5 * 60 * 1000);

const server = Bun.serve({
  port: process.env.PORT || 3001,
  
  // HTTP routes
  fetch(request, server) {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upgrade to WebSocket for game connections
    if (url.pathname === '/game') {
      const upgraded = server.upgrade(request);
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 });
      }
    }

    // CORS headers for all requests
    const headers = new Headers({
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    return new Response('Not Found', { status: 404, headers });
  },

  // WebSocket handlers
  websocket: {
    open(ws) {
      wsService.handleConnection(ws);
    },
    
    message(ws, message) {
      wsService.handleMessage(ws, message as string);
    },
    
    close(ws) {
      wsService.handleDisconnection(ws);
    },
  },
});

console.log(`🎮 Never Have I Ever Game Server running on http://localhost:${server.port}`);
console.log(`🔌 WebSocket endpoint: ws://localhost:${server.port}/game`);
console.log(`🏥 Health check: http://localhost:${server.port}/health`);
