import { serve } from 'bun';
import { BookService } from './src/services/bookService';
import type { CreateBookRequest, UpdateBookRequest } from './src/types/book';

// Environment configuration
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGINS || '*';
const SERVICE_NAME = process.env.SERVICE_NAME || 'Book Library API';
const bookService = new BookService();

// Helper functions
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': CORS_ORIGINS,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

function errorResponse(error: string, message: string, status: number) {
  return jsonResponse({ error, message }, status);
}

const server = serve({
  port: PORT,
  hostname: '0.0.0.0', // Bind to all interfaces for Docker compatibility
  async fetch(req: Request) {
    const url = new URL(req.url);
    const method = req.method;
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      // Health check endpoint
      if (url.pathname === '/api/health') {
        return jsonResponse({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: SERVICE_NAME
        });
      }

      // Books collection endpoint
      if (url.pathname === '/api/books') {
        if (method === 'GET') {
          const query = url.searchParams.get('q');
          const isReadParam = url.searchParams.get('isRead');
          const isRead = isReadParam ? isReadParam === 'true' : undefined;

          const books = await bookService.searchBooks(query || undefined, isRead);
          return jsonResponse({
            books,
            total: books.length,
            filters: {
              query: query || null,
              isRead: isRead !== undefined ? isRead : null,
            }
          });
        }

        if (method === 'POST') {
          const body = await req.json() as any;
          
          if (!body.title || !body.author || !body.genre || 
              typeof body.title !== 'string' || typeof body.author !== 'string' || typeof body.genre !== 'string') {
            return errorResponse('VALIDATION_ERROR', 'Title, author, and genre are required and must be strings', 400);
          }

          const bookData: CreateBookRequest = {
            title: body.title.trim(),
            author: body.author.trim(),
            genre: body.genre.trim(),
            isRead: Boolean(body.isRead),
            rating: body.rating && typeof body.rating === 'number' ? Math.max(1, Math.min(5, body.rating)) : undefined,
          };

          const newBook = await bookService.createBook(bookData);
          return jsonResponse({ book: newBook }, 201);
        }
      }

      // Individual book endpoints
      const bookIdMatch = url.pathname.match(/^\/api\/books\/([a-f0-9\-]+)$/);
      if (bookIdMatch && bookIdMatch[1]) {
        const id = bookIdMatch[1];

        if (method === 'GET') {
          const book = await bookService.getBookById(id);
          if (!book) {
            return errorResponse('NOT_FOUND', 'Book not found', 404);
          }
          return jsonResponse({ book });
        }

        if (method === 'PUT') {
          const body = await req.json() as any;
          const updateData: UpdateBookRequest = {};

          if (body.title !== undefined && typeof body.title === 'string') updateData.title = body.title.trim();
          if (body.author !== undefined && typeof body.author === 'string') updateData.author = body.author.trim();
          if (body.genre !== undefined && typeof body.genre === 'string') updateData.genre = body.genre.trim();
          if (body.isRead !== undefined) updateData.isRead = Boolean(body.isRead);
          if (body.rating !== undefined) {
            updateData.rating = typeof body.rating === 'number' ? Math.max(1, Math.min(5, body.rating)) : undefined;
          }

          const updatedBook = await bookService.updateBook(id, updateData);
          if (!updatedBook) {
            return errorResponse('NOT_FOUND', 'Book not found', 404);
          }
          return jsonResponse({ book: updatedBook });
        }

        if (method === 'DELETE') {
          const deleted = await bookService.deleteBook(id);
          if (!deleted) {
            return errorResponse('NOT_FOUND', 'Book not found', 404);
          }
          return jsonResponse({ message: 'Book deleted successfully' });
        }
      }

      // 404 for unknown routes
      return errorResponse('NOT_FOUND', `Route ${method} ${url.pathname} not found`, 404);
      
    } catch (error) {
      console.error('Server error:', error);
      return errorResponse('SERVER_ERROR', 'Internal server error', 500);
    }
  },
});

console.log(`🚀 ${SERVICE_NAME} server running at http://localhost:${PORT}`);
console.log(`📚 Available endpoints:`);
console.log(`  GET    http://localhost:${PORT}/api/health`);
console.log(`  GET    http://localhost:${PORT}/api/books`);