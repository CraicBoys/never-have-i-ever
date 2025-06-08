// Bun request interface
import { BookService } from '../services/bookService';
import type { CreateBookRequest, UpdateBookRequest, ErrorResponse } from '../types/book';

const bookService = new BookService();

function createErrorResponse(error: string, message: string, status: number): Response {
  const errorResponse: ErrorResponse = { error, message };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function validateBookData(data: any): CreateBookRequest | null {
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    return null;
  }
  if (!data.author || typeof data.author !== 'string' || data.author.trim() === '') {
    return null;
  }
  if (!data.genre || typeof data.genre !== 'string' || data.genre.trim() === '') {
    return null;
  }
  
  return {
    title: data.title.trim(),
    author: data.author.trim(),
    genre: data.genre.trim(),
    isRead: Boolean(data.isRead),
    rating: data.rating && typeof data.rating === 'number' ? Math.max(1, Math.min(5, data.rating)) : undefined,
  };
}

export const bookRoutes = {
  // GET /api/books - Get all books with optional filtering
  async GET(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get('q');
      const isReadParam = url.searchParams.get('isRead');
      const isRead = isReadParam ? isReadParam === 'true' : undefined;

      const books = await bookService.searchBooks(query || undefined, isRead);
      
      return createSuccessResponse({
        books,
        total: books.length,
        filters: {
          query: query || null,
          isRead: isRead !== undefined ? isRead : null,
        }
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      return createErrorResponse('FETCH_ERROR', 'Failed to fetch books', 500);
    }
  },

  // POST /api/books - Create a new book
  async POST(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const bookData = validateBookData(body);
      
      if (!bookData) {
        return createErrorResponse('VALIDATION_ERROR', 'Invalid book data. Title, author, and genre are required.', 400);
      }

      const newBook = await bookService.createBook(bookData);
      return createSuccessResponse({ book: newBook }, 201);
    } catch (error) {
      console.error('Error creating book:', error);
      return createErrorResponse('CREATE_ERROR', 'Failed to create book', 500);
    }
  },
};

export const bookByIdRoutes = {
  // GET /api/books/:id - Get a specific book
  async GET(req: Request): Promise<Response> {
    const id = req.params.id;
    
    if (!id) {
      return createErrorResponse('VALIDATION_ERROR', 'Book ID is required', 400);
    }

    try {
      const book = await bookService.getBookById(id);
      
      if (!book) {
        return createErrorResponse('NOT_FOUND', 'Book not found', 404);
      }

      return createSuccessResponse({ book });
    } catch (error) {
      console.error('Error fetching book:', error);
      return createErrorResponse('FETCH_ERROR', 'Failed to fetch book', 500);
    }
  },

  // PUT /api/books/:id - Update a specific book
  async PUT(req: Request): Promise<Response> {
    const id = req.params.id;
    
    if (!id) {
      return createErrorResponse('VALIDATION_ERROR', 'Book ID is required', 400);
    }

    try {
      const body = await req.json();
      const updateData: UpdateBookRequest = {};

      // Validate and clean update data
      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || body.title.trim() === '') {
          return createErrorResponse('VALIDATION_ERROR', 'Title must be a non-empty string', 400);
        }
        updateData.title = body.title.trim();
      }

      if (body.author !== undefined) {
        if (typeof body.author !== 'string' || body.author.trim() === '') {
          return createErrorResponse('VALIDATION_ERROR', 'Author must be a non-empty string', 400);
        }
        updateData.author = body.author.trim();
      }

      if (body.genre !== undefined) {
        if (typeof body.genre !== 'string' || body.genre.trim() === '') {
          return createErrorResponse('VALIDATION_ERROR', 'Genre must be a non-empty string', 400);
        }
        updateData.genre = body.genre.trim();
      }

      if (body.isRead !== undefined) {
        updateData.isRead = Boolean(body.isRead);
      }

      if (body.rating !== undefined) {
        if (typeof body.rating === 'number') {
          updateData.rating = Math.max(1, Math.min(5, body.rating));
        } else if (body.rating === null) {
          updateData.rating = undefined;
        }
      }

      const updatedBook = await bookService.updateBook(id, updateData);
      
      if (!updatedBook) {
        return createErrorResponse('NOT_FOUND', 'Book not found', 404);
      }

      return createSuccessResponse({ book: updatedBook });
    } catch (error) {
      console.error('Error updating book:', error);
      return createErrorResponse('UPDATE_ERROR', 'Failed to update book', 500);
    }
  },

  // DELETE /api/books/:id - Delete a specific book
  async DELETE(req: Request): Promise<Response> {
    const id = req.params.id;
    
    if (!id) {
      return createErrorResponse('VALIDATION_ERROR', 'Book ID is required', 400);
    }

    try {
      const deleted = await bookService.deleteBook(id);
      
      if (!deleted) {
        return createErrorResponse('NOT_FOUND', 'Book not found', 404);
      }

      return createSuccessResponse({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      return createErrorResponse('DELETE_ERROR', 'Failed to delete book', 500);
    }
  },
}; 