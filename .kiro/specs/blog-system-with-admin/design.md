# Design Document

## Overview

The Blog System with Admin Dashboard is built on Next.js 14+ using the App Router architecture, providing a modern, performant blogging platform with a rich admin interface. The system follows a clean architecture pattern with clear separation between presentation, business logic, and data access layers.

The design leverages Next.js's hybrid rendering capabilities - using Server Components for optimal performance on public pages and Client Components for interactive admin features. The rich text editor is powered by Tiptap, providing a flexible and extensible editing experience. PostgreSQL serves as the primary database with Prisma ORM for type-safe database access.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        PC[Public Client]
        AC[Admin Client]
    end
    
    subgraph "Next.js App Router"
        subgraph "Public Routes"
            HP[Home Page /]
            BL[Blog List /blog]
            BP[Blog Post /blog/[slug]]
        end
        
        subgraph "Admin Routes"
            AD[Dashboard /admin]
            PM[Posts Management /admin/posts]
            PE[Post Editor /admin/posts/new]
            ML[Media Library /admin/media]
            CM[Categories /admin/categories]
            TM[Tags /admin/tags]
        end
        
        subgraph "API Routes"
            AUTH[/api/auth/*]
            POSTS[/api/posts/*]
            MEDIA[/api/media/*]
            CAT[/api/categories/*]
            TAG[/api/tags/*]
        end
    end
    
    subgraph "Services Layer"
        PS[Post Service]
        MS[Media Service]
        CS[Category Service]
        TS[Tag Service]
        AS[Auth Service]
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL)]
        STORAGE[Cloudinary/Vercel Blob]
    end
    
    PC --> HP
    PC --> BL
    PC --> BP
    AC --> AD
    AC --> PM
    AC --> PE
    AC --> ML
    AC --> CM
    AC --> TM
    
    AD --> POSTS
    PM --> POSTS
    PE --> POSTS
    PE --> MEDIA
    ML --> MEDIA
    CM --> CAT
    TM --> TAG
    
    POSTS --> PS
    MEDIA --> MS
    CAT --> CS
    TAG --> TS
    AUTH --> AS
    
    PS --> PRISMA
    MS --> PRISMA
    MS --> STORAGE
    CS --> PRISMA
    TS --> PRISMA
    AS --> PRISMA
    
    PRISMA --> DB
```

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Rich Text Editor**: Tiptap with extensions
- **Image Storage**: Cloudinary or Vercel Blob Storage
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Data Fetching**: TanStack Query (React Query)
- **Deployment**: Vercel

### Rendering Strategy

- **Public Pages** (`/`, `/blog`, `/blog/[slug]`): Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
  - Revalidate every 60 seconds for updated content
  - Fallback: 'blocking' for new posts
  
- **Admin Pages** (`/admin/*`): Client-Side Rendering (CSR) with Server Components where possible
  - Protected by middleware
  - Real-time updates with React Query
  
- **API Routes**: Server-side only, protected by authentication middleware

## Components and Interfaces

### Core Components

#### 1. Rich Text Editor Component

**Location**: `src/components/editor/TiptapEditor.tsx`

**Purpose**: Provides the main rich text editing interface with toolbar and extensions

**Props**:

```typescript
interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}
```

**Features**:

- Toolbar with formatting buttons
- Drag-and-drop image upload
- Auto-save functionality (handled by parent)
- Full-screen mode toggle
- Character/word count display
- Code syntax highlighting
- Link insertion with validation
- Video embed support

**Tiptap Extensions**:

- StarterKit (basic formatting)
- Image (with resize and alignment)
- Link (with auto-detection)
- CodeBlockLowlight (syntax highlighting)
- Placeholder
- CharacterCount
- Youtube (video embeds)
- Table
- TaskList

#### 2. Post Editor Layout

**Location**: `src/app/admin/posts/[id]/edit/page.tsx`

**Structure**:

```
┌─────────────────────────────────────────────────────┐
│ Header: Save Draft | Publish | Preview              │
├──────────┬──────────────────────────┬────────────────┤
│          │                          │                │
│ Left     │   Main Editor Area       │ Right Sidebar  │
│ Sidebar  │                          │                │
│          │   - Title Input          │ - Publish      │
│ - Posts  │   - Slug Editor          │   Settings     │
│ - Media  │   - Rich Text Editor     │ - Featured     │
│ - Cats   │   - Word Count           │   Image        │
│ - Tags   │                          │ - Excerpt      │
│ - Settings│                         │ - Categories   │
│          │                          │ - Tags         │
│          │                          │ - SEO          │
│          │                          │                │
└──────────┴──────────────────────────┴────────────────┘
```

**Components**:

- `EditorHeader`: Top action bar
- `EditorSidebar`: Left navigation
- `TitleInput`: Auto-slug generation
- `TiptapEditor`: Main editor
- `PublishPanel`: Right sidebar with all metadata
- `FeaturedImageUpload`: Image selector
- `CategorySelector`: Checkbox list
- `TagInput`: Tag management with autocomplete
- `SEOPanel`: Meta fields

#### 3. Posts Management Table

**Location**: `src/app/admin/posts/page.tsx`

**Features**:

- Server-side pagination
- Real-time search
- Bulk actions
- Status filters
- Quick edit modal

**Component Structure**:

```typescript
<PostsTable>
  <TableToolbar>
    <SearchInput />
    <StatusFilter />
    <BulkActions />
  </TableToolbar>
  <Table>
    <TableHeader />
    <TableBody>
      {posts.map(post => (
        <PostRow
          key={post.id}
          post={post}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onQuickEdit={handleQuickEdit}
        />
      ))}
    </TableBody>
  </Table>
  <Pagination />
</PostsTable>
```

#### 4. Media Library Grid

**Location**: `src/app/admin/media/page.tsx`

**Features**:

- Grid layout with thumbnails
- Drag-and-drop upload zone
- Image detail modal
- Search and filter
- Copy URL functionality

**Component Structure**:

```typescript
<MediaLibrary>
  <MediaToolbar>
    <UploadButton />
    <SearchInput />
    <DateFilter />
  </MediaToolbar>
  <DropZone onDrop={handleUpload}>
    <MediaGrid>
      {images.map(image => (
        <MediaCard
          key={image.id}
          image={image}
          onClick={openDetailModal}
        />
      ))}
    </MediaGrid>
  </DropZone>
  <MediaDetailModal />
</MediaLibrary>
```

#### 5. Public Blog Components

**Blog List Page** (`src/app/blog/page.tsx`):

```typescript
<BlogListPage>
  <BlogHeader />
  <div className="flex">
    <BlogSidebar>
      <CategoryList />
      <PopularPosts />
      <TagCloud />
    </BlogSidebar>
    <main>
      <SearchBar />
      <FilterBar />
      <PostGrid>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </PostGrid>
      <InfiniteScroll />
    </main>
  </div>
</BlogListPage>
```

**Blog Post Page** (`src/app/blog/[slug]/page.tsx`):

```typescript
<BlogPostPage>
  <ArticleHeader>
    <FeaturedImage />
    <Title />
    <AuthorInfo />
    <PublishDate />
    <ReadTime />
  </ArticleHeader>
  <div className="flex">
    <TableOfContents />
    <article>
      <RichTextContent />
      <SocialShareButtons />
    </article>
  </div>
  <RelatedPosts />
</BlogPostPage>
```

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String
  role          Role      @default(USER)
  avatarUrl     String?   @map("avatar_url")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  posts         Post[]
  
  @@map("users")
}

enum Role {
  ADMIN
  USER
}

model Post {
  id                String      @id @default(uuid())
  title             String
  slug              String      @unique
  content           String      @db.Text
  excerpt           String?     @db.VarChar(200)
  featuredImageUrl  String?     @map("featured_image_url")
  authorId          String      @map("author_id")
  status            PostStatus  @default(DRAFT)
  visibility        Visibility  @default(PUBLIC)
  publishedAt       DateTime?   @map("published_at")
  viewCount         Int         @default(0) @map("view_count")
  metaTitle         String?     @map("meta_title")
  metaDescription   String?     @map("meta_description")
  focusKeyword      String?     @map("focus_keyword")
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")
  
  author            User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categories        PostCategory[]
  tags              PostTag[]
  
  @@index([slug])
  @@index([status, publishedAt])
  @@index([authorId])
  @@map("posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Visibility {
  PUBLIC
  PRIVATE
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?   @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  posts       PostCategory[]
  
  @@map("categories")
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  posts     PostTag[]
  
  @@map("tags")
}

model PostCategory {
  postId     String   @map("post_id")
  categoryId String   @map("category_id")
  
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([postId, categoryId])
  @@map("post_categories")
}

model PostTag {
  postId  String   @map("post_id")
  tagId   String   @map("tag_id")
  
  post    Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag     Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
  @@map("post_tags")
}

model Media {
  id          String    @id @default(uuid())
  filename    String
  url         String
  thumbnailUrl String?  @map("thumbnail_url")
  mimeType    String    @map("mime_type")
  size        Int
  width       Int?
  height      Int?
  altText     String?   @map("alt_text")
  uploadedBy  String    @map("uploaded_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  
  @@index([uploadedBy])
  @@map("media")
}
```

### TypeScript Interfaces

```typescript
// src/types/post.ts

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  authorId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  publishedAt?: Date;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  categories?: Category[];
  tags?: Tag[];
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  visibility?: 'PUBLIC' | 'PRIVATE';
  publishedAt?: Date;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

// src/types/category.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/tag.ts

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/media.ts

export interface Media {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  uploadedBy: string;
  createdAt: Date;
}
```

## Error Handling

### Error Types

```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}
```

### Error Handling Strategy

1. **API Routes**: Use try-catch blocks with centralized error handler

```typescript
// src/lib/api-handler.ts

export function apiHandler(handler: Function) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      
      console.error('Unhandled error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

2. **Client Components**: Use error boundaries and toast notifications

```typescript
// src/components/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component {
  // Catch rendering errors
}

// Use toast for user-facing errors
toast.error('Failed to save post. Please try again.');
```

3. **Form Validation**: Use Zod schemas with React Hook Form

```typescript
// src/lib/validations/post.ts

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(200).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  // ... more fields
});
```

4. **Database Errors**: Handle Prisma errors gracefully

```typescript
// src/lib/prisma-error-handler.ts

export function handlePrismaError(error: any): never {
  if (error.code === 'P2002') {
    throw new ConflictError('A record with this value already exists');
  }
  if (error.code === 'P2025') {
    throw new NotFoundError('Record');
  }
  throw error;
}
```

## Testing Strategy

### Unit Tests

**Tools**: Jest, React Testing Library

**Coverage**:

- Utility functions (slug generation, date formatting, etc.)
- Validation schemas
- Service layer functions
- React components (isolated)

**Example**:

```typescript
// src/lib/__tests__/slug.test.ts

describe('generateSlug', () => {
  it('should convert title to URL-friendly slug', () => {
    expect(generateSlug('Hello World!')).toBe('hello-world');
  });
  
  it('should handle special characters', () => {
    expect(generateSlug('AI & ML: The Future')).toBe('ai-ml-the-future');
  });
});
```

### Integration Tests

**Tools**: Jest, MSW (Mock Service Worker)

**Coverage**:

- API routes with database interactions
- Authentication flows
- CRUD operations

**Example**:

```typescript
// src/app/api/posts/__tests__/route.test.ts

describe('POST /api/posts', () => {
  it('should create a new post', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      title: 'Test Post',
      status: 'DRAFT'
    });
  });
  
  it('should require authentication', async () => {
    const response = await POST(unauthenticatedRequest);
    expect(response.status).toBe(401);
  });
});
```

### End-to-End Tests

**Tools**: Playwright

**Coverage**:

- Complete user flows (create post, publish, view on public site)
- Admin dashboard navigation
- Media upload workflow
- Authentication flows

**Example**:

```typescript
// e2e/admin/create-post.spec.ts

test('admin can create and publish a post', async ({ page }) => {
  await page.goto('/admin/posts/new');
  await page.fill('[name="title"]', 'My First Post');
  await page.fill('.tiptap', 'This is the content');
  await page.click('button:has-text("Publish")');
  
  await expect(page).toHaveURL(/\/admin\/posts$/);
  await expect(page.locator('text=My First Post')).toBeVisible();
});
```

### Performance Tests

**Tools**: Lighthouse CI, Next.js Bundle Analyzer

**Metrics**:

- Page load time < 2 seconds
- First Contentful Paint < 1.5 seconds
- Time to Interactive < 3 seconds
- Lighthouse Performance score > 90
- Lighthouse SEO score > 90

**Automated Checks**:

- Run Lighthouse CI on every PR
- Monitor bundle size
- Check for unused dependencies

### Testing Workflow

1. **Pre-commit**: Run unit tests and linting
2. **PR**: Run all tests + Lighthouse CI
3. **Staging**: Run E2E tests
4. **Production**: Monitor with real user metrics

## Security Considerations

### Input Sanitization

- **Rich Text Content**: Use DOMPurify to sanitize HTML before rendering

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedContent = DOMPurify.sanitize(post.content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'pre', 'code', 'blockquote'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id']
});
```

- **User Inputs**: Validate all inputs with Zod schemas
- **SQL Injection**: Use Prisma ORM (parameterized queries)

### Authentication & Authorization

- **Session Management**: Use NextAuth.js with JWT tokens
- **Password Hashing**: Use bcrypt with salt rounds = 10
- **CSRF Protection**: Built into Next.js forms
- **Rate Limiting**: Implement on auth endpoints

```typescript
// src/middleware.ts

import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### File Upload Security

- **File Type Validation**: Check MIME type and extension
- **File Size Limits**: Max 5MB per image
- **Malware Scanning**: Use Cloudinary's built-in scanning
- **Signed URLs**: Use temporary signed URLs for uploads

### API Security

- **HTTPS Only**: Enforce in production
- **CORS**: Configure allowed origins
- **Content Security Policy**: Set strict CSP headers

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://res.cloudinary.com; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];
```

## Performance Optimization

### Rendering Strategy

- **Static Generation**: Pre-render blog list and post pages at build time
- **ISR**: Revalidate every 60 seconds for updated content
- **Streaming**: Use React Suspense for loading states

### Image Optimization

- **Next.js Image**: Automatic optimization and lazy loading
- **Responsive Images**: Generate multiple sizes
- **WebP Format**: Serve modern formats with fallbacks
- **CDN**: Use Cloudinary or Vercel's CDN

### Code Splitting

- **Dynamic Imports**: Load heavy components on demand

```typescript
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />
});
```

### Caching Strategy

- **Static Assets**: Cache-Control headers for long-term caching
- **API Responses**: Use SWR/React Query with stale-while-revalidate
- **Database Queries**: Implement query result caching with Redis (future)

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Code Splitting**: Split by route
- **Lazy Loading**: Load non-critical components lazily
- **Bundle Analysis**: Monitor bundle size with @next/bundle-analyzer

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────┐
│           Vercel Edge Network           │
│  (CDN + Edge Functions + Middleware)    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼────────┐
│  Static Pages  │  │  API Routes   │
│  (SSG + ISR)   │  │  (Serverless) │
└────────────────┘  └───────┬───────┘
                            │
                    ┌───────┴────────┐
                    │                │
            ┌───────▼──────┐  ┌─────▼──────┐
            │  PostgreSQL  │  │ Cloudinary │
            │   (Vercel)   │  │  (Images)  │
            └──────────────┘  └────────────┘
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://www.403-ai.com"
NEXTAUTH_SECRET="..."

# Image Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Optional
NEXT_PUBLIC_APP_URL="https://www.403-ai.com"
```

### CI/CD Pipeline

1. **Push to branch** → Vercel creates preview deployment
2. **Open PR** → Run tests, linting, Lighthouse CI
3. **Merge to main** → Deploy to production
4. **Post-deployment** → Run smoke tests

## Future Enhancements

1. **Comments System**: Add threaded comments with moderation
2. **Search**: Implement full-text search with Algolia
3. **Analytics**: Custom analytics dashboard
4. **Versioning**: Post revision history
5. **Collaboration**: Multi-author support with roles
6. **Scheduling**: Advanced post scheduling
7. **AI Features**: AI-powered content suggestions, auto-tagging
8. **Internationalization**: Multi-language support
