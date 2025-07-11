import { serve } from "bun";
import { GameService } from './src/services/GameService.js';
import { GamePhase } from './src/types/Game.js';

const gameService = new GameService();

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

console.log('🎮 Never Have I Ever Game Server starting...');

const server = serve({
  port: 3001,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Get available lobbies
    if (url.pathname === '/api/lobbies' && req.method === 'GET') {
      try {
        const lobbies = gameService.getAvailableLobbies();
        return new Response(JSON.stringify({ lobbies }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to get lobbies' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Create room
    if (url.pathname === '/api/rooms' && req.method === 'POST') {
      try {
        const body = await req.json() as { playerName: string };
        const { game, hostPlayer } = gameService.createGame(body.playerName);
        
        return new Response(JSON.stringify({
          gameId: game.id,
          playerId: hostPlayer.id,
          roomCode: game.roomCode,
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create room' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Join room by game ID
    if (url.pathname === '/api/rooms/join' && req.method === 'POST') {
      try {
        const body = await req.json() as { gameId: string; playerName: string };
        const result = gameService.joinGameById(body.gameId, body.playerName);
        
        if (!result) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const { game, player } = result;
        
        return new Response(JSON.stringify({
          gameId: game.id,
          playerId: player.id,
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Failed to join room' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Get game state
    if (url.pathname.startsWith('/api/games/') && req.method === 'GET') {
      try {
        const gameId = url.pathname.split('/')[3];
        if (!gameId) {
          return new Response(JSON.stringify({ error: 'Game ID required' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }
        
        const game = gameService.getGame(gameId);
        
        if (!game) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        return new Response(JSON.stringify({
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to get game state' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Start game phase
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/start') && req.method === 'POST') {
      try {
        const gameId = url.pathname.split('/')[3];
        const body = await req.json() as { playerId: string };
        
        if (!gameId) {
          return new Response(JSON.stringify({ error: 'Game ID required' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }
        
        const game = gameService.getGame(gameId);
        if (!game) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const player = game.players[body.playerId];
        if (!player?.isHost) {
          return new Response(JSON.stringify({ error: 'Only host can start game' }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const success = gameService.startStatementPhase(gameId);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Cannot start game' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const updatedGame = gameService.getGame(gameId)!;
        return new Response(JSON.stringify({
          gameState: {
            roomCode: updatedGame.roomCode,
            players: Object.values(updatedGame.players),
            phase: updatedGame.phase,
            currentStatementIndex: updatedGame.currentStatementIndex,
            totalStatements: updatedGame.statements.length,
            canStart: Object.keys(updatedGame.players).length >= updatedGame.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to start game' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Submit statement
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/statements') && req.method === 'POST') {
      try {
        const gameId = url.pathname.split('/')[3];
        const body = await req.json() as { playerId: string; statement: string };
        
        if (!gameId) {
          return new Response(JSON.stringify({ error: 'Game ID required' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }
        
        const success = gameService.submitStatement(gameId, body.playerId, body.statement);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to submit statement' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const game = gameService.getGame(gameId)!;
        
        // Mark player as having submitted statement
        if (game.players[body.playerId]) {
          game.players[body.playerId].hasSubmittedStatement = true;
        }

        // Check if all players submitted and auto-advance to guessing
        const playerCount = Object.keys(game.players).length;
        if (game.statements.length === playerCount && game.phase === GamePhase.SUBMITTING_STATEMENTS) {
          gameService.startGuessingPhase(gameId);
        }

        const updatedGame = gameService.getGame(gameId)!;
        return new Response(JSON.stringify({
          gameState: {
            roomCode: updatedGame.roomCode,
            players: Object.values(updatedGame.players),
            phase: updatedGame.phase,
            currentStatementIndex: updatedGame.currentStatementIndex,
            totalStatements: updatedGame.statements.length,
            canStart: Object.keys(updatedGame.players).length >= updatedGame.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit statement' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  },
});

console.log('🎮 Never Have I Ever Game Server running on http://localhost:3001');
console.log('🔌 HTTP API endpoints:');
console.log('  GET  /health - Health check');
console.log('  GET  /api/lobbies - Get available lobbies');
console.log('  POST /api/rooms - Create new room');
console.log('  POST /api/rooms/join - Join room by game ID');
console.log('  GET  /api/games/:id - Get game state');
console.log('  POST /api/games/:id/start - Start game');
console.log('  POST /api/games/:id/statements - Submit statement');
console.log('🏥 Health check: http://localhost:3001/health');

// Cleanup inactive games every 5 minutes
setInterval(() => {
  gameService.cleanupInactiveGames();
}, 5 * 60 * 1000);
