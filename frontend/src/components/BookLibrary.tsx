import { useState } from 'react';
import { Book as BookIcon, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooks } from '../hooks/useBooks';
import { BookList } from './BookList';
import { BookForm } from './BookForm';
import type { Book, CreateBookRequest } from '../types/book';

export function BookLibrary() {
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  const {
    books,
    loading,
    error,
    total,
    createBook,
    updateBook,
    deleteBook,
    applyFilters,
    clearError,
  } = useBooks();

  const handleSearch = () => {
    const filters: { query?: string; isRead?: boolean } = {};
    if (searchQuery.trim()) filters.query = searchQuery.trim();
    if (readFilter !== 'all') filters.isRead = readFilter === 'read';
    applyFilters(filters);
  };

  const handleCreateBook = async (bookData: CreateBookRequest) => {
    const newBook = await createBook(bookData);
    if (newBook) {
      setShowForm(false);
    }
  };

  const handleUpdateBook = async (bookData: CreateBookRequest) => {
    if (editingBook) {
      const updatedBook = await updateBook(editingBook.id, bookData);
      if (updatedBook) {
        setEditingBook(null);
        setShowForm(false);
      }
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBook(null);
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <BookForm
          book={editingBook}
          onSubmit={editingBook ? handleUpdateBook : handleCreateBook}
          onCancel={handleCloseForm}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Personal Book Library</h1>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={readFilter} onValueChange={(value: 'all' | 'read' | 'unread') => setReadFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
          
          {(searchQuery || readFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {searchQuery && (
                <span className="bg-secondary px-2 py-1 rounded">
                  Query: "{searchQuery}"
                </span>
              )}
              {readFilter !== 'all' && (
                <span className="bg-secondary px-2 py-1 rounded">
                  Status: {readFilter}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setReadFilter('all');
                  applyFilters({});
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Book Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-muted-foreground">
          {loading ? 'Loading...' : `${total} book${total !== 1 ? 's' : ''} in your library`}
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Books List */}
      <BookList
        books={books}
        loading={loading}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
        onToggleRead={(book) => updateBook(book.id, { isRead: !book.isRead })}
      />
    </div>
  );
} 