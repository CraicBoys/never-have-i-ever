# ⚙️ TRD: Never Have I Ever Game

## 🏗️ Architecture Overview
The Never Have I Ever game will be built as a real-time multiplayer web application using WebSocket connections for live game state synchronization. The architecture follows a client-server model with React frontend and Bun-powered backend.

## 🔧 Technical Requirements

### Frontend
**Technology Stack:**
- React 19 with TypeScript
- TailwindCSS for styling
- Shadcn/ui components
- WebSocket client for real-time communication
- React Hook Form with Zod validation
- Lucide React for icons

**Key Components:**
- `GameLobby`: Room creation and joining interface
- `PlayerJoin`: Name entry and connection management
- `StatementSubmission`: Anonymous statement input form
- `GuessingPhase`: Voting interface for statement attribution
- `DrinkingPhase`: Traditional game mechanics display
- `Leaderboard`: Real-time scoring display
- `GameResults`: Final summary and statistics

### Backend
**Technology Stack:**
- Bun runtime with TypeScript
- WebSocket server for real-time communication
- In-memory game state management
- CORS enabled for frontend communication

**Core Services:**
- `GameService`: Manages game rooms and state
- `WebSocketService`: Handles real-time player communication
- `ScoringService`: Calculates and tracks dual scoring systems
- `StatementService`: Manages anonymous statement handling

### Real-time Communication
**WebSocket Events:**
```typescript
// Client -> Server
- 'create-room': Create new game room
- 'join-room': Join existing room with code
- 'submit-statement': Add anonymous statement
- 'submit-guess': Vote on statement author
- 'drink-action': Record drinking activity
- 'start-phase': Progress game to next phase

// Server -> Client
- 'room-created': Room code and initial state
- 'player-joined': Updated player list
- 'phase-changed': Game phase progression
- 'statement-revealed': Next statement for guessing
- 'scores-updated': Real-time leaderboard update
- 'game-ended': Final results and statistics
```

## 📁 File Structure
```
src/
├── components/
│   ├── game/
│   │   ├── GameLobby.tsx
│   │   ├── PlayerJoin.tsx
│   │   ├── StatementSubmission.tsx
│   │   ├── GuessingPhase.tsx
│   │   ├── DrinkingPhase.tsx
│   │   ├── Leaderboard.tsx
│   │   └── GameResults.tsx
│   └── ui/ (shadcn components)
├── hooks/
│   ├── useWebSocket.ts
│   ├── useGameState.ts
│   └── useScoring.ts
├── services/
│   ├── websocket.ts
│   └── gameClient.ts
├── types/
│   ├── game.ts
│   ├── player.ts
│   └── websocket.ts
└── utils/
    ├── roomCode.ts
    └── scoring.ts

backend/src/
├── services/
│   ├── GameService.ts
│   ├── WebSocketService.ts
│   ├── ScoringService.ts
│   └── StatementService.ts
├── types/
│   ├── Game.ts
│   ├── Player.ts
│   └── WebSocket.ts
└── utils/
    └── roomGenerator.ts
```

## 🔒 Security Considerations
- **Input Validation**: All statements validated for length and content appropriateness
- **Rate Limiting**: Prevent spam submissions and rapid-fire actions
- **Room Code Security**: Generate cryptographically secure room codes
- **Anonymous Statements**: Ensure no metadata leaks statement authors
- **Session Management**: Auto-cleanup inactive rooms after 30 minutes

## 🧪 Testing Strategy
**Unit Tests:**
- Scoring calculations and logic
- Room code generation and validation
- Statement anonymization functions
- WebSocket event handling

**Integration Tests:**
- Full game flow from creation to completion
- Multi-player interactions and edge cases
- WebSocket connection stability
- Real-time state synchronization

**E2E Tests:**
- Complete user journeys for all player counts
- Cross-browser compatibility testing
- Mobile responsive design validation

## 📦 Dependencies

**Frontend New Dependencies:**
```json
{
  "socket.io-client": "^4.7.0",
  "react-router-dom": "^6.21.0",
  "react-hot-toast": "^2.4.1"
}
```

**Backend New Dependencies:**
```json
{
  "ws": "^8.16.0",
  "@types/ws": "^8.5.10",
  "uuid": "^9.0.1",
  "@types/uuid": "^9.0.7"
}
```

## 🚀 Deployment Notes
- **Environment Variables**: `PORT`, `CORS_ORIGIN`, `NODE_ENV`
- **WebSocket Configuration**: Ensure proxy settings support WebSocket upgrades
- **Session Storage**: In-memory storage suitable for MVP, consider Redis for scale
- **Monitoring**: Track active rooms, player connections, and game completion rates
- **Graceful Shutdown**: Properly close WebSocket connections on server restart

## 🎯 Performance Requirements
- **Response Time**: < 100ms for WebSocket message handling
- **Concurrent Games**: Support 50+ simultaneous game rooms
- **Memory Usage**: < 10MB per active game room
- **Connection Limits**: Handle 200+ concurrent WebSocket connections
- **Auto-cleanup**: Remove inactive rooms after 30 minutes 