import { useState, useEffect, useCallback } from 'react';
import { bookApi, ApiError } from '../lib/api';
import type { Book, CreateBookRequest, UpdateBookRequest } from '../types/book';

interface UseBooksState {
  books: Book[];
  loading: boolean;
  error: string | null;
  total: number;
}

interface UseBooksFilters {
  query?: string;
  isRead?: boolean;
}

export function useBooks(initialFilters?: UseBooksFilters) {
  const [state, setState] = useState<UseBooksState>({
    books: [],
    loading: true,
    error: null,
    total: 0,
  });

  const [filters, setFilters] = useState<UseBooksFilters>(initialFilters || {});

  const fetchBooks = useCallback(async (currentFilters?: UseBooksFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await bookApi.getBooks(currentFilters || filters);
      setState({
        books: response.books,
        loading: false,
        error: null,
        total: response.total,
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.response.message 
        : 'Failed to fetch books';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [filters]);

  const createBook = useCallback(async (bookData: CreateBookRequest): Promise<Book | null> => {
    try {
      const response = await bookApi.createBook(bookData);
      await fetchBooks(); // Refresh the list
      return response.book;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.response.message 
        : 'Failed to create book';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [fetchBooks]);

  const updateBook = useCallback(async (id: string, updateData: UpdateBookRequest): Promise<Book | null> => {
    try {
      const response = await bookApi.updateBook(id, updateData);
      await fetchBooks(); // Refresh the list
      return response.book;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.response.message 
        : 'Failed to update book';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [fetchBooks]);

  const deleteBook = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bookApi.deleteBook(id);
      await fetchBooks(); // Refresh the list
      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.response.message 
        : 'Failed to delete book';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [fetchBooks]);

  const applyFilters = useCallback((newFilters: UseBooksFilters) => {
    setFilters(newFilters);
    fetchBooks(newFilters);
  }, [fetchBooks]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    ...state,
    filters,
    applyFilters,
    createBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
    clearError,
  };
} 