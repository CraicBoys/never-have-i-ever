import type { Book } from '../types/book';

const DATA_DIR = process.env.DATA_DIR || './data';
const BOOKS_FILE = `${DATA_DIR}/books.json`;

async function ensureDataDirectory(): Promise<void> {
  try {
    await Bun.write(`${DATA_DIR}/.keep`, '');
  } catch (error) {
    // Directory creation will happen automatically when we write the file
  }
}

export async function readBooksFromFile(): Promise<Book[]> {
  try {
    // Ensure data directory exists
    await ensureDataDirectory();
    
    const file = Bun.file(BOOKS_FILE);
    const exists = await file.exists();
    
    if (!exists) {
      // Create empty books file if it doesn't exist
      await writeBooksToFile([]);
      return [];
    }
    
    const content = await file.text();
    if (!content.trim()) {
      return [];
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading books file:', error);
    return [];
  }
}

export async function writeBooksToFile(books: Book[]): Promise<void> {
  try {
    await Bun.write(BOOKS_FILE, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error writing books file:', error);
    throw new Error('Failed to save books');
  }
}

export async function fileExists(): Promise<boolean> {
  const file = Bun.file(BOOKS_FILE);
  return await file.exists();
} 