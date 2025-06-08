import type { Book, CreateBookRequest, UpdateBookRequest, BooksResponse, BookResponse, ErrorResponse } from '../types/book';

// Use environment variable if available (build time), otherwise fallback to localhost
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, public response: ErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new ApiError(response.status, errorData);
  }

  return response.json();
}

export const bookApi = {
  // Get all books with optional filtering
  async getBooks(params?: { query?: string; isRead?: boolean }): Promise<BooksResponse> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('q', params.query);
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    
    const endpoint = `/books${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest<BooksResponse>(endpoint);
  },

  // Get a specific book by ID
  async getBook(id: string): Promise<BookResponse> {
    return apiRequest<BookResponse>(`/books/${id}`);
  },

  // Create a new book
  async createBook(bookData: CreateBookRequest): Promise<BookResponse> {
    return apiRequest<BookResponse>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  // Update an existing book
  async updateBook(id: string, updateData: UpdateBookRequest): Promise<BookResponse> {
    return apiRequest<BookResponse>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a book
  async deleteBook(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/books/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError }; 