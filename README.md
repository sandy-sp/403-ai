# 403 AI - Forbidden AI

> A modern, full-featured blogging platform dedicated to sharing AI research, conducting discussions, publishing AI news, and exploring forbidden knowledge in the AI/ML space.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5+-2D3748?style=flat-square&logo=prisma)

## ✨ Features

### 🎨 Modern UI/UX
- Dark-themed cyberpunk aesthetic with electric cyan and purple accents
- Fully responsive design optimized for all devices
- Smooth animations and transitions
- Accessible and user-friendly interface

### ✍️ Rich Content Editor
- **Blogger-style dashboard** with intuitive three-column layout
- **Tiptap rich text editor** with full formatting capabilities:
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1-H4), lists, quotes, code blocks
  - Image upload with drag-and-drop
  - YouTube video embeds
  - Tables and task lists
  - Syntax highlighting for code
- **Auto-save** every 30 seconds
- **Live preview** mode
- **Character and word count**

### 📝 Content Management
- Create, edit, and publish blog posts
- Draft, published, and archived status management
- Categories and tags for organization
- Featured images with automatic optimization
- SEO settings (meta title, description, focus keyword)
- Excerpt generation
- Scheduled publishing

### 🖼️ Media Library
- Drag-and-drop image upload
- Automatic image optimization via Cloudinary
- Thumbnail generation
- Search and filter capabilities
- Image details and metadata
- Copy URL to clipboard

### 🔐 Security & Authentication
- NextAuth.js v5 (Auth.js) integration
- Role-based access control (Admin/User)
- Password hashing with bcrypt
- Protected admin routes with middleware
- CSRF protection
- Input sanitization and XSS prevention
- Content Security Policy headers

### 🚀 Performance & SEO
- **Static Site Generation (SSG)** for blog pages
- **Incremental Static Regeneration (ISR)** for updated content
- Automatic sitemap generation
- Robots.txt configuration
- Open Graph and Twitter Card meta tags
- JSON-LD structured data
- Image lazy loading and optimization
- Code splitting and tree shaking
- Lighthouse score >90

### 📊 Admin Dashboard
- Overview statistics (posts, views, drafts)
- Recent posts list
- Quick actions
- Posts management with search and filters
- Bulk operations
- Categories and tags management

### 🌐 Public Pages
- Beautiful home page with latest posts
- Blog list with search, filters, and pagination
- Individual post pages with:
  - Related posts
  - Social sharing buttons
  - Author information
  - View counter
  - Table of contents for long posts

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js v5 |
| **Rich Text Editor** | Tiptap |
| **Image Storage** | Cloudinary |
| **Form Handling** | React Hook Form |
| **Validation** | Zod |
| **Data Fetching** | TanStack Query |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Deployment** | Vercel |

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/403-ai.git
cd 403-ai

# Run the setup script
./scripts/setup.sh
```

### Manual Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Set up database
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials

```
Email: admin@403-ai.com
Password: admin123
```

**⚠️ Change this password immediately after first login!**

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment checklist and guide
- **[.kiro/specs/](./kiro/specs/)** - Complete project specifications

## 🏗️ Project Structure

```
403-ai/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (signin, signup)
│   ├── admin/               # Admin dashboard
│   │   ├── posts/          # Posts management
│   │   ├── categories/     # Categories management
│   │   ├── tags/           # Tags management
│   │   └── media/          # Media library
│   ├── blog/               # Public blog pages
│   │   ├── [slug]/        # Individual post pages
│   │   └── page.tsx       # Blog list page
│   └── api/                # API routes
│       ├── auth/          # Authentication endpoints
│       ├── posts/         # Posts CRUD
│       ├── categories/    # Categories CRUD
│       ├── tags/          # Tags CRUD
│       └── media/         # Media upload/management
├── components/              # React components
│   ├── admin/             # Admin-specific components
│   ├── blog/              # Blog-specific components
│   ├── editor/            # Rich text editor components
│   └── providers/         # Context providers
├── lib/                     # Utilities and business logic
│   ├── services/          # Service layer (Post, Category, Tag, Media)
│   ├── utils/             # Helper functions
│   ├── validations/       # Zod validation schemas
│   ├── auth.ts            # Authentication configuration
│   ├── prisma.ts          # Prisma client
│   └── errors.ts          # Custom error classes
├── prisma/                  # Database
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
└── public/                  # Static assets
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🎯 Roadmap

- [ ] Comment system
- [ ] Newsletter integration
- [ ] Full-text search (Algolia)
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] User profiles
- [ ] Discussion forum
- [ ] AI-powered content recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Editor powered by [Tiptap](https://tiptap.dev/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with ❤️ for the AI community**

For questions or support, please open an issue on GitHub.
