import { Edit, Trash2, BookOpen, BookCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Book } from '../types/book';

interface BookListProps {
  books: Book[];
  loading: boolean;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onToggleRead: (book: Book) => void;
}

function BookCard({ book, onEdit, onDelete, onToggleRead }: {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onToggleRead: (book: Book) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {book.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              by {book.author}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(book)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(book.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Genre */}
          <div className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-xs font-medium">
            {book.genre}
          </div>

          {/* Reading Status */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant={book.isRead ? "default" : "outline"}
              onClick={() => onToggleRead(book)}
              className="flex items-center gap-2"
            >
              {book.isRead ? (
                <>
                  <BookCheck className="h-4 w-4" />
                  Read
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Mark as Read
                </>
              )}
            </Button>
          </div>

          {/* Rating (if book is read) */}
          {book.isRead && book.rating && (
            <div>
              {renderStars(book.rating)}
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Added: {formatDate(book.dateAdded)}</div>
            {book.dateRead && (
              <div>Finished: {formatDate(book.dateRead)}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookList({ books, loading, onEdit, onDelete, onToggleRead }: BookListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-64">
            <CardHeader>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-6">
            Start building your library by adding your first book!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  );
} 