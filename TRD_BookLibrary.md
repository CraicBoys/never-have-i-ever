# ⚙️ TRD: Personal Book Library Manager

## 🏗️ Architecture Overview
A full-stack application with separate frontend and backend applications, both using Bun. The frontend is a React SPA, and the backend is a dedicated Bun server API. Data persistence through JSON file storage for simplicity and portability.

## 🔧 Technical Requirements

### Frontend
- **Technology Stack**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React hooks (useState, useEffect) 
- **HTTP Client**: Fetch API for backend communication
- **Component Structure**: 
  - BookList component for displaying books
  - BookForm component for add/edit operations
  - BookCard component for individual book display
  - FilterControls for status filtering

### Backend
- **Runtime**: Dedicated Bun server application
- **Port**: 3001 (frontend will proxy API calls)
- **API Endpoints**:
  - `GET /api/books` - Retrieve all books
  - `POST /api/books` - Add new book
  - `PUT /api/books/:id` - Update existing book
  - `DELETE /api/books/:id` - Delete book
- **Data Storage**: JSON file (`books.json`) in backend directory
- **CORS**: Enabled for frontend development
- **Data Model**:
  ```typescript
  interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    isRead: boolean;
    rating?: number; // 1-5 stars
    dateAdded: string;
    dateRead?: string;
  }
  ```

### Integration
- **API Communication**: RESTful JSON APIs
- **Error Handling**: Proper HTTP status codes and error messages
- **File Operations**: Bun's native file system APIs for JSON read/write

## 📁 File Structure
```
backend/
├── src/
│   ├── index.ts                 # Main server file
│   ├── routes/
│   │   └── books.ts             # Book API routes
│   ├── services/
│   │   └── bookService.ts       # Book business logic
│   ├── types/
│   │   └── book.ts              # Shared TypeScript interfaces
│   └── utils/
│       └── fileUtils.ts         # JSON file operations
├── package.json                 # Backend dependencies
├── tsconfig.json               # TypeScript config
└── books.json                  # Data storage file

frontend/
├── src/
│   ├── components/
│   │   ├── BookLibrary.tsx      # Main library component
│   │   ├── BookList.tsx         # Books display list  
│   │   ├── BookForm.tsx         # Add/edit form
│   │   ├── BookCard.tsx         # Individual book card
│   │   └── FilterControls.tsx   # Status filters
│   ├── hooks/
│   │   └── useBooks.ts          # Custom hook for book operations
│   ├── types/
│   │   └── book.ts              # TypeScript interfaces
│   └── lib/
│       └── api.ts               # API client functions
```

## 🔒 Security Considerations
- Input validation on both frontend and backend
- Sanitize user input to prevent file system issues
- Basic error handling to prevent information disclosure
- No authentication needed for this demo app

## 🧪 Testing Strategy
- **Manual Testing**: Verify all CRUD operations work correctly
- **Error Testing**: Test with invalid inputs and edge cases
- **Persistence Testing**: Ensure data survives server restarts
- **UI Testing**: Verify responsive design and user interactions

## 📦 Dependencies
**New packages needed:**
- `uuid` - For generating unique book IDs
- `zod` - For input validation (optional but recommended)

**Existing packages to leverage:**
- shadcn/ui components (Card, Button, Input, etc.)
- Tailwind CSS for styling
- TypeScript for type safety

## 🚀 Deployment Notes
- JSON file should be gitignored in production
- File permissions for read/write access to books.json
- Consider file locking for concurrent access (not needed for demo)
- Bun's fast startup time makes development iteration quick 