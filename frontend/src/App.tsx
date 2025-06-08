import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameState } from './hooks/useGameState';
import type { GameState, Player } from './types/game';
import { GamePhase } from './types/game';
import { GameLobby } from './components/game/GameLobby';
import { WaitingRoom } from './components/game/WaitingRoom';
import { GuessStatement } from './components/game/GuessStatement';
import SubmitStatements from './components/SubmitStatements';

// Wrapper component for GuessStatement that manages statement fetching
function GuessStatementWrapper({
  gameState,
  currentPlayer,
  submitGuess,
  getCurrentStatement
}: {
  gameState: GameState;
  currentPlayer: Player | null;
  submitGuess: (statementId: string, guessedAuthorId: string) => Promise<boolean>;
  getCurrentStatement: () => Promise<any>;
}) {
  const [currentStatement, setCurrentStatement] = useState<{id: string; text: string; voteCount: number} | null>(null);
  const [hasSubmittedGuess, setHasSubmittedGuess] = useState(false);

  // Fetch current statement when component mounts or statement index changes
  useEffect(() => {
    const fetchStatement = async () => {
      const statement = await getCurrentStatement();
      if (statement) {
        setCurrentStatement(statement);
        setHasSubmittedGuess(false); // Reset guess status for new statement
      }
    };
    
    fetchStatement();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchStatement, 2000);
    return () => clearInterval(interval);
  }, [getCurrentStatement, gameState.currentStatementIndex]);

  const handleSubmitGuess = useCallback(async (playerId: string) => {
    if (!currentStatement) return;
    
    const success = await submitGuess(currentStatement.id, playerId);
    if (success) {
      setHasSubmittedGuess(true);
    }
  }, [submitGuess, currentStatement]);

  if (!currentStatement) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading statement...</p>
      </div>
    );
  }

  return (
    <GuessStatement
      gameState={gameState}
      currentPlayer={currentPlayer}
      currentStatement={currentStatement.text}
      onSubmitGuess={handleSubmitGuess}
      hasSubmittedGuess={hasSubmittedGuess}
      voteCount={currentStatement.voteCount}
    />
  );
}

function App() {
  const [playerName, setPlayerName] = useState('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // 🎵 CHIPTUNE CHAOS GENERATOR 🎵
  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        
        // Create insane chiptune sounds
        const createChiptuneChaos = () => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          // Random frequency chaos
          const frequencies = [220, 440, 880, 1760, 110, 55];
          oscillator.frequency.setValueAtTime(
            frequencies[Math.floor(Math.random() * frequencies.length)], 
            ctx.currentTime
          );
          
          // Random wave types
          const waveTypes: OscillatorType[] = ['square', 'sawtooth', 'triangle'];
          oscillator.type = waveTypes[Math.floor(Math.random() * waveTypes.length)];
          
          // Volume chaos
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
        };
        
        // Play random chiptune chaos every 3-8 seconds
        const playChiptuneChaos = () => {
          if (Math.random() > 0.3) { // 70% chance to play
            createChiptuneChaos();
          }
          setTimeout(playChiptuneChaos, Math.random() * 5000 + 3000);
        };
        
        // Start the chaos after user interaction
        document.addEventListener('click', () => {
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          playChiptuneChaos();
        }, { once: true });
        
      } catch (error) {
        console.log('Audio chaos failed:', error);
      }
    };
    
    initAudio();
  }, []);

  const {
    gameState,
    currentPlayer,
    isConnected,
    isConnecting,
    isHost,
    canStartGame,
    createRoom,
    joinLobby,
    getLobbies,
    submitStatement,
    submitGuess,
    getCurrentStatement,
    startGame,
    lobbies
  } = useGameState();

  const renderGamePhase = () => {
    if (!isConnected || !gameState) {
      return (
        <GameLobby
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onCreateRoom={createRoom}
          onJoinLobby={joinLobby}
          onRefreshLobbies={getLobbies}
          lobbies={lobbies}
          isConnecting={isConnecting}
        />
      );
    }

    switch (gameState.phase) {
      case GamePhase.WAITING:
        return (
          <WaitingRoom
            gameState={gameState}
            currentPlayer={currentPlayer}
            onStartGame={startGame}
            canStartGame={canStartGame}
            isConnected={isConnected}
          />
        );
      
      case GamePhase.SUBMITTING_STATEMENTS:
        return (
          <SubmitStatements
            players={gameState.players}
            currentPlayerId={currentPlayer?.id || ''}
            onSubmitStatement={submitStatement}
            isHost={isHost}
            onStartNextPhase={() => {
              // This will be auto-handled by the backend when all statements are submitted
              console.log('All statements submitted, waiting for backend to advance phase');
            }}
          />
        );
      
      case GamePhase.GUESSING:
        return (
          <GuessStatementWrapper
            gameState={gameState}
            currentPlayer={currentPlayer}
            submitGuess={submitGuess}
            getCurrentStatement={getCurrentStatement}
          />
        );
      
      default:
        return (
          <div className="game-container">
            <div className="game-header">
              <h1 className="game-title">Coming Soon</h1>
              <p className="game-subtitle">
                {gameState.phase} phase will be implemented next!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dark">
      {/* 🎵 CHIPTUNE CHAOS VISUAL INDICATOR 🎵 */}
      <div className="audio-chaos-indicator">
        <div className="sound-wave wave-1"></div>
        <div className="sound-wave wave-2"></div>
        <div className="sound-wave wave-3"></div>
        <div className="sound-wave wave-4"></div>
        <div className="sound-wave wave-5"></div>
        <span className="audio-text">🎵 CHIPTUNE CHAOS ACTIVE 🎵</span>
      </div>
      
      {/* 🎮 RETRO GAMING OVERLAY INSANITY 🎮 */}
      <div className="retro-gaming-overlay">
        <div className="pixel-art-element pixel-1"></div>
        <div className="pixel-art-element pixel-2"></div>
        <div className="pixel-art-element pixel-3"></div>
        <div className="pixel-art-element pixel-4"></div>
        <div className="pixel-art-element pixel-5"></div>
        <div className="glitch-scanner"></div>
        <div className="crt-lines"></div>
      </div>

      {/* CORPORATE MEMPHIS CHAOS OVERLAY */}
      <div className="corporate-memphis-overlay">
        <div className="memphis-blob blob-1"></div>
        <div className="memphis-blob blob-2"></div>
        <div className="memphis-blob blob-3"></div>
        <div className="memphis-shape shape-1"></div>
        <div className="memphis-shape shape-2"></div>
        <div className="memphis-shape shape-3"></div>
        <div className="memphis-shape shape-4"></div>
        <div className="memphis-shape shape-5"></div>
        <div className="memphis-shape shape-6"></div>
      </div>

      {/* IRASUTOYA HORROR SIDEBAR */}
      <div className="irasutoya-sidebar">
        <div className="irasutoya-character char-1"></div>
        <div className="irasutoya-character char-2"></div>
        <div className="irasutoya-character char-3"></div>
        <div className="irasutoya-character char-4"></div>
        <div className="irasutoya-character char-5"></div>
        <div className="irasutoya-text">
          <span>がんばって！</span>
          <span>すごい！</span>
          <span>やったー！</span>
          <span>最高！</span>
          <span>危険！</span>
        </div>
        <div className="japanese-particle-system">
          <div className="particle p-1">✨</div>
          <div className="particle p-2">🌟</div>
          <div className="particle p-3">💫</div>
          <div className="particle p-4">⭐</div>
          <div className="particle p-5">🎌</div>
        </div>
      </div>

      {/* 🌈 VAPORWAVE NIGHTMARE SIDEBAR 🌈 */}
      <div className="vaporwave-sidebar">
        <div className="vaporwave-element vw-1"></div>
        <div className="vaporwave-element vw-2"></div>
        <div className="vaporwave-element vw-3"></div>
        <div className="neon-grid"></div>
        <div className="retro-sun"></div>
      </div>

      {/* MAIN CONTENT WITH HORRIFIC STRUCTURE */}
      <div className="game-container">
        {/* FLOATING CORPORATE ELEMENTS */}
        <div className="floating-corporate-elements">
          <div className="corporate-icon icon-1">💼</div>
          <div className="corporate-icon icon-2">📊</div>
          <div className="corporate-icon icon-3">🚀</div>
          <div className="corporate-icon icon-4">💡</div>
          <div className="corporate-icon icon-5">⭐</div>
          <div className="corporate-icon icon-6">🎯</div>
          <div className="corporate-icon icon-7">🔥</div>
          <div className="corporate-icon icon-8">⚡</div>
        </div>

        {/* 🎪 CIRCUS OF MADNESS OVERLAY 🎪 */}
        <div className="circus-madness">
          <div className="circus-element circus-1"></div>
          <div className="circus-element circus-2"></div>
          <div className="circus-element circus-3"></div>
          <div className="spinning-wheel"></div>
          <div className="confetti-explosion"></div>
        </div>

        {/* ASYMMETRIC HEADER DISASTER */}
        <div className="asymmetric-header">
          <div className="header-section section-1">
            <h1 className="game-title chaos-title">🍺 Never Have I Ever</h1>
            <div className="title-decoration"></div>
          </div>
          <div className="header-section section-2">
            <p className="game-subtitle corporate-subtitle">The ultimate party game with a twist!</p>
            <div className="subtitle-shape"></div>
          </div>
          <div className="header-section section-3">
            <div className="header-blob"></div>
          </div>
        </div>
        
        {/* CONTENT IN CHAOS GRID */}
        <div className="chaos-grid">
          <div className="grid-item item-1">
            <div className="decorative-element element-1"></div>
          </div>
          <div className="grid-item item-2 main-content">
            <main className="content-wrapper">
              {renderGamePhase()}
            </main>
          </div>
          <div className="grid-item item-3">
            <div className="decorative-element element-2"></div>
          </div>
          <div className="grid-item item-4">
            <div className="decorative-element element-3"></div>
          </div>
          <div className="grid-item item-5">
            <div className="floating-mascot"></div>
          </div>
        </div>

        {/* BOTTOM CHAOS BAR */}
        <div className="chaos-bottom-bar">
          <div className="bar-segment segment-1"></div>
          <div className="bar-segment segment-2"></div>
          <div className="bar-segment segment-3"></div>
          <div className="bar-segment segment-4"></div>
        </div>
        
        {/* 🤖 MATRIX HACKER BOT 🤖 */}
        <div className="matrix-bot">🤖</div>
        
        {/* ⚡ GLITCH MATRIX CHAOS ⚡ */}
        <div className="matrix-chaos">
          <div className="glitch-text error-1">[ERROR]</div>
          <div className="glitch-text warning-1">[WARNING]</div>
          <div className="glitch-text binary-1">01001000</div>
          <div className="glitch-text system-1">[SYSTEM]</div>
          <div className="glitch-text breach-1">[BREACH]</div>
          <div className="glitch-text access-1">[ACCESS_DENIED]</div>
          <div className="glitch-text hack-1">[HACKING...]</div>
          <div className="glitch-text virus-1">[VIRUS_DETECTED]</div>
          <div className="glitch-text firewall-1">[FIREWALL_DOWN]</div>
          <div className="glitch-text skull">💀</div>
          <div className="glitch-text terminal">💻</div>
          <div className="glitch-text lightning">⚡</div>
          <div className="glitch-text warning-2">[CORRUPTED]</div>
          <div className="glitch-text error-2">[FATAL_ERROR]</div>
        </div>
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}

export default App;
