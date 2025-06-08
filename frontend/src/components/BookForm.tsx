import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Book, CreateBookRequest } from '../types/book';

interface BookFormProps {
  book?: Book | null;
  onSubmit: (bookData: CreateBookRequest) => void;
  onCancel: () => void;
}

const genres = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Self-Help',
  'Technology',
  'Other'
];

export function BookForm({ book, onSubmit, onCancel }: BookFormProps) {
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: '',
    author: '',
    genre: '',
    isRead: false,
    rating: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        isRead: book.isRead,
        rating: book.rating,
      });
    }
  }, [book]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }

    if (formData.rating !== undefined && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
      });
    }
  };

  const handleInputChange = (field: keyof CreateBookRequest, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {book ? 'Edit Book' : 'Add New Book'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter book title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Enter author name"
              className={errors.author ? 'border-destructive' : ''}
            />
            {errors.author && (
              <p className="text-sm text-destructive">{errors.author}</p>
            )}
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre *</Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => handleInputChange('genre', value)}
            >
              <SelectTrigger className={errors.genre ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.genre && (
              <p className="text-sm text-destructive">{errors.genre}</p>
            )}
          </div>

          {/* Read Status */}
          <div className="space-y-2">
            <Label>Reading Status</Label>
            <Select
              value={formData.isRead ? 'read' : 'unread'}
              onValueChange={(value) => handleInputChange('isRead', value === 'read')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unread">Not Read Yet</SelectItem>
                <SelectItem value="read">Finished Reading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating (only if read) */}
          {formData.isRead && (
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5 stars)</Label>
              <Select
                value={formData.rating?.toString() || 'none'}
                onValueChange={(value) => handleInputChange('rating', value === 'none' ? undefined : parseInt(value))}
              >
                <SelectTrigger className={errors.rating ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No rating</SelectItem>
                  <SelectItem value="1">⭐ 1 star</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 stars</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 stars</SelectItem>
                </SelectContent>
              </Select>
              {errors.rating && (
                <p className="text-sm text-destructive">{errors.rating}</p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {book ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 