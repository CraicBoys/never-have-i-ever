export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isRead: boolean;
  rating?: number; // 1-5 stars
  dateAdded: string;
  dateRead?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  isRead?: boolean;
  rating?: number;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  isRead?: boolean;
  rating?: number;
  dateRead?: string;
}

export interface BooksResponse {
  books: Book[];
  total: number;
  filters: {
    query: string | null;
    isRead: boolean | null;
  };
}

export interface BookResponse {
  book: Book;
}

export interface ErrorResponse {
  error: string;
  message: string;
} 