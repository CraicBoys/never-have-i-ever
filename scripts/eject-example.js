#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Ejecting Book Library example...\n');

try {
  // Files to remove
  const filesToRemove = [
    'PRD_BookLibrary.md',
    'TRD_BookLibrary.md', 
    'PROGRESS_BookLibrary.md',
    'backend/books.json',
    'backend/src/types/book.ts',
    'backend/src/services/bookService.ts',
    'backend/src/utils/fileUtils.ts',
    'backend/src/routes/books.ts',
    'frontend/src/types/book.ts',
    'frontend/src/lib/api.ts',
    'frontend/src/hooks/useBooks.ts',
    'frontend/src/components/BookLibrary.tsx',
    'frontend/src/components/BookForm.tsx',
    'frontend/src/components/BookList.tsx'
  ];

  // Remove example files
  console.log('📁 Removing example files...');
  filesToRemove.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Removed ${file}`);
    }
  });

  // Reset backend/index.ts to basic template
  console.log('\n🔧 Resetting backend/index.ts...');
  const basicBackendContent = 'import { serve } from \'bun\';\n\n' +
    'const PORT = process.env.PORT || 3001;\n\n' +
    'const server = serve({\n' +
    '  port: PORT,\n' +
    '  async fetch(req: Request) {\n' +
    '    const url = new URL(req.url);\n' +
    '    const method = req.method;\n' +
    '    \n' +
    '    // Enable CORS\n' +
    '    const corsHeaders = {\n' +
    '      \'Access-Control-Allow-Origin\': \'*\',\n' +
    '      \'Access-Control-Allow-Methods\': \'GET, POST, PUT, DELETE, OPTIONS\',\n' +
    '      \'Access-Control-Allow-Headers\': \'Content-Type, Authorization\',\n' +
    '    };\n\n' +
    '    // Handle preflight requests\n' +
    '    if (method === \'OPTIONS\') {\n' +
    '      return new Response(null, { headers: corsHeaders });\n' +
    '    }\n\n' +
    '    // Health check endpoint\n' +
    '    if (url.pathname === \'/api/health\') {\n' +
    '      return new Response(JSON.stringify({ \n' +
    '        status: \'healthy\', \n' +
    '        timestamp: new Date().toISOString(),\n' +
    '        service: \'Your API Name\'\n' +
    '      }), {\n' +
    '        headers: { \n' +
    '          \'Content-Type\': \'application/json\',\n' +
    '          ...corsHeaders \n' +
    '        }\n' +
    '      });\n' +
    '    }\n\n' +
    '    // Add your API routes here\n' +
    '    \n' +
    '    // 404 for unknown routes\n' +
    '    return new Response(JSON.stringify({ error: \'Not Found\' }), {\n' +
    '      status: 404,\n' +
    '      headers: { \n' +
    '        \'Content-Type\': \'application/json\',\n' +
    '        ...corsHeaders \n' +
    '      }\n' +
    '    });\n' +
    '  },\n' +
    '});\n\n' +
    'console.log(`🚀 API server running at http://localhost:${PORT}`);\n' +
    'console.log(`📚 Available endpoints:`);\n' +
    'console.log(`  GET    http://localhost:${PORT}/api/health`);\n';

  fs.writeFileSync('backend/index.ts', basicBackendContent);
  console.log('   ✅ Reset backend/index.ts');

  // Reset frontend/src/App.tsx to basic template
  console.log('\n🎨 Resetting frontend/src/App.tsx...');
  const basicFrontendContent = 'import { Card, CardContent } from "@/components/ui/card";\n' +
    'import "./index.css";\n\n' +
    'export function App() {\n' +
    '  return (\n' +
    '    <div className="container mx-auto p-8 text-center relative z-10">\n' +
    '      <Card className="bg-card/50 backdrop-blur-sm border-muted max-w-2xl mx-auto">\n' +
    '        <CardContent className="pt-6">\n' +
    '          <h1 className="text-4xl font-bold my-4 leading-tight">\n' +
    '            🚀 Bun + React Template\n' +
    '          </h1>\n' +
    '          <p className="text-muted-foreground mb-6">\n' +
    '            Your full-stack application is ready to build!\n' +
    '          </p>\n' +
    '          <div className="text-left space-y-3 text-sm">\n' +
    '            <div className="bg-muted p-3 rounded">\n' +
    '              <strong>Backend:</strong> http://localhost:3001\n' +
    '            </div>\n' +
    '            <div className="bg-muted p-3 rounded">\n' +
    '              <strong>Frontend:</strong> http://localhost:3000\n' +
    '            </div>\n' +
    '          </div>\n' +
    '          <p className="text-xs text-muted-foreground mt-4">\n' +
    '            Edit <code className="bg-muted px-1 rounded">src/App.tsx</code> to start building your app\n' +
    '          </p>\n' +
    '        </CardContent>\n' +
    '      </Card>\n' +
    '    </div>\n' +
    '  );\n' +
    '}\n\n' +
    'export default App;\n';

  fs.writeFileSync('frontend/src/App.tsx', basicFrontendContent);
  console.log('   ✅ Reset frontend/src/App.tsx');

  // Remove book-specific dependencies from backend
  console.log('\n📦 Cleaning up backend dependencies...');
  const backendPackagePath = 'backend/package.json';
  if (fs.existsSync(backendPackagePath)) {
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    delete backendPackage.dependencies.uuid;
    delete backendPackage.dependencies['@types/uuid'];
    fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
    console.log('   ✅ Removed uuid dependencies from backend');
  }

  // Clean up empty directories
  console.log('\n🧹 Cleaning up empty directories...');
  const dirsToCheck = [
    'backend/src/types',
    'backend/src/services', 
    'backend/src/utils',
    'backend/src/routes',
    'frontend/src/types',
    'frontend/src/hooks'
  ];

  dirsToCheck.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
      console.log('   ✅ Removed empty directory ' + dir);
    }
  });

  console.log('\n✨ Book Library example ejected successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: bun run install:all');
  console.log('   2. Run: bun run dev');
  console.log('   3. Start building your application!');
  console.log('\n📖 Check the README.md for the development workflow.');

} catch (error) {
  console.error('❌ Error ejecting example:', error.message);
  process.exit(1);
} 