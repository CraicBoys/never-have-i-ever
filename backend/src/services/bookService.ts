import { v4 as uuidv4 } from 'uuid';
import type { Book, CreateBookRequest, UpdateBookRequest } from '../types/book';
import { readBooksFromFile, writeBooksToFile } from '../utils/fileUtils';

export class BookService {
  async getAllBooks(): Promise<Book[]> {
    return await readBooksFromFile();
  }

  async getBookById(id: string): Promise<Book | null> {
    const books = await readBooksFromFile();
    return books.find(book => book.id === id) || null;
  }

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    const books = await readBooksFromFile();
    
    const newBook: Book = {
      id: uuidv4(),
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre,
      isRead: bookData.isRead || false,
      rating: bookData.rating,
      dateAdded: new Date().toISOString(),
      dateRead: bookData.isRead ? new Date().toISOString() : undefined,
    };

    books.push(newBook);
    await writeBooksToFile(books);
    
    return newBook;
  }

  async updateBook(id: string, updateData: UpdateBookRequest): Promise<Book | null> {
    const books = await readBooksFromFile();
    const bookIndex = books.findIndex(book => book.id === id);
    
    if (bookIndex === -1) {
      return null;
    }

    const existingBook = books[bookIndex];
    if (!existingBook) {
      return null;
    }

    const updatedBook: Book = {
      id: existingBook.id,
      title: updateData.title ?? existingBook.title,
      author: updateData.author ?? existingBook.author,
      genre: updateData.genre ?? existingBook.genre,
      isRead: updateData.isRead ?? existingBook.isRead,
      rating: updateData.rating ?? existingBook.rating,
      dateAdded: existingBook.dateAdded,
      dateRead: existingBook.dateRead,
    };

    // Set dateRead if marking as read
    if (updateData.isRead === true && !existingBook.isRead) {
      updatedBook.dateRead = new Date().toISOString();
    } else if (updateData.isRead === false) {
      updatedBook.dateRead = undefined;
    } else if (updateData.dateRead !== undefined) {
      updatedBook.dateRead = updateData.dateRead;
    }

    books[bookIndex] = updatedBook;
    await writeBooksToFile(books);
    
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    const books = await readBooksFromFile();
    const bookIndex = books.findIndex(book => book.id === id);
    
    if (bookIndex === -1) {
      return false;
    }

    books.splice(bookIndex, 1);
    await writeBooksToFile(books);
    
    return true;
  }

  async searchBooks(query?: string, isRead?: boolean): Promise<Book[]> {
    const books = await readBooksFromFile();
    let filteredBooks = books;

    // Filter by read status if specified
    if (typeof isRead === 'boolean') {
      filteredBooks = filteredBooks.filter(book => book.isRead === isRead);
    }

    // Filter by search query if specified
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm)
      );
    }

    return filteredBooks;
  }
} 