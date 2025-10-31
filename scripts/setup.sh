#!/bin/bash

echo "🚀 403 AI - Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and add your configuration values"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate
echo "✅ Prisma client generated"
echo ""

# Ask if user wants to set up database
read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Setting up database..."
    npm run db:push
    echo "✅ Database schema created"
    echo ""
    
    read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        npm run db:seed
        echo "✅ Database seeded"
        echo ""
        echo "📧 Admin credentials:"
        echo "   Email: admin@403-ai.com"
        echo "   Password: admin123"
        echo "   ⚠️  Change this password after first login!"
        echo ""
    fi
fi

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Sign in at http://localhost:3000/signin"
echo ""
echo "📚 For more information, see SETUP.md"
echo ""
echo "Happy coding! 🎉"
