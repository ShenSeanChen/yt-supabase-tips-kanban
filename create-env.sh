#!/bin/bash

# Create .env.local file for Supabase Kanban project

echo "🚀 Setting up your Supabase environment variables..."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Creating backup..."
    cp .env.local .env.local.backup
    echo "✅ Backup created: .env.local.backup"
fi

# Get user input
echo "📋 Please provide your Supabase credentials:"
echo "   (Get these from your Supabase project: Settings → API)"
echo ""

read -p "🔗 Supabase Project URL: " SUPABASE_URL
read -p "🔑 Supabase Anon Key: " SUPABASE_KEY

# Create .env.local file
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Supabase dashboard → SQL Editor"
echo "2. Copy and paste the contents of 'database.sql'"
echo "3. Run the query to create tables and policies"
echo "4. Restart your development server: npm run dev"
echo ""
echo "🔐 Optional: Enable Google OAuth in Authentication → Settings"
echo ""
echo "🎉 You're all set! Happy coding!" 