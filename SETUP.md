# 403 AI - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Cloudinary account (for image storage)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/403ai?schema=public"

# Authentication - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Cloudinary - Get these from your Cloudinary dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

Generate Prisma client:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

This will create:
- An admin user (email: `admin@403-ai.com`, password: `admin123`)
- Sample categories (AI Research, Machine Learning, Deep Learning, NLP)
- Sample tags (GPT, Transformers, LLM, Computer Vision, Reinforcement Learning)
- A welcome blog post

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Access Admin Dashboard

1. Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)
2. Sign in with:
   - Email: `admin@403-ai.com`
   - Password: `admin123`
3. You'll be redirected to the admin dashboard at `/admin`

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

## Features Overview

### Admin Dashboard (`/admin`)

- **Dashboard**: Overview statistics and recent posts
- **Posts**: Create, edit, and manage blog posts with rich text editor
- **Categories**: Organize posts into categories
- **Tags**: Label posts with tags
- **Media**: Upload and manage images

### Public Pages

- **Home** (`/`): Landing page with latest posts
- **Blog** (`/blog`): List of all published posts with search and filters
- **Blog Post** (`/blog/[slug]`): Individual post pages with SEO optimization

## Key Features

### Rich Text Editor

- Full-featured Tiptap editor with:
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1-H4)
  - Lists (bullet, numbered)
  - Links and images
  - Code blocks with syntax highlighting
  - YouTube video embeds
  - Tables
  - Auto-save every 30 seconds

### SEO Optimization

- Dynamic meta tags
- Open Graph tags for social sharing
- JSON-LD structured data
- Automatic sitemap generation
- Robots.txt configuration

### Image Management

- Drag-and-drop upload
- Automatic optimization via Cloudinary
- Thumbnail generation
- Image library with search

### Security

- NextAuth.js authentication
- Role-based access control (Admin/User)
- Password hashing with bcrypt
- CSRF protection
- Input sanitization
- Content Security Policy headers

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:seed         # Seed database with initial data
npm run db:studio       # Open Prisma Studio (database GUI)

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (same as `.env`)
4. Deploy!

### 3. Set Up Production Database

Use Vercel Postgres or any PostgreSQL provider:

1. Create a production database
2. Update `DATABASE_URL` in Vercel environment variables
3. Run migrations:

```bash
npx prisma db push
npx prisma db seed
```

### 4. Configure Custom Domain

1. Go to your Vercel project settings
2. Add your custom domain (www.403-ai.com)
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database credentials

### Cloudinary Upload Fails

- Verify Cloudinary credentials in `.env`
- Check file size (max 5MB)
- Ensure file type is supported (JPG, PNG, WebP, GIF)

### Authentication Issues

- Ensure NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check that NEXTAUTH_URL matches your domain

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run db:generate
```

## Project Structure

```
403-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── blog/              # Public blog pages
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── blog/             # Blog components
│   └── editor/           # Rich text editor
├── lib/                   # Utilities and services
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
├── prisma/               # Database schema
└── public/               # Static assets
```

## Support

For issues or questions:
1. Check this setup guide
2. Review the README.md
3. Check the code comments
4. Review the spec documents in `.kiro/specs/`

## Next Steps

1. Change the default admin password
2. Customize the design and branding
3. Add your own content
4. Configure Cloudinary
5. Set up your production database
6. Deploy to Vercel
7. Configure your custom domain

Happy blogging! 🚀
