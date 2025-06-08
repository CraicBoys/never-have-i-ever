import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a short, user-friendly room code
 * @returns A 6-character uppercase alphanumeric room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a unique game ID
 * @returns A UUID string
 */
export function generateGameId(): string {
  return uuidv4();
}

/**
 * Generates a unique player ID
 * @returns A UUID string
 */
export function generatePlayerId(): string {
  return uuidv4();
}

/**
 * Generates a unique statement ID
 * @returns A UUID string
 */
export function generateStatementId(): string {
  return uuidv4();
} 