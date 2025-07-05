@echo off
echo 🚀 Setting up your Supabase environment variables...
echo.

REM Check if .env.local already exists
if exist .env.local (
    echo ⚠️  .env.local already exists. Creating backup...
    copy .env.local .env.local.backup >nul
    echo ✅ Backup created: .env.local.backup
)

REM Get user input
echo 📋 Please provide your Supabase credentials:
echo    (Get these from your Supabase project: Settings → API)
echo.

set /p SUPABASE_URL="🔗 Supabase Project URL: "
set /p SUPABASE_KEY="🔑 Supabase Anon Key: "

REM Create .env.local file
echo # Supabase Configuration > .env.local
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL% >> .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_KEY% >> .env.local

echo.
echo ✅ .env.local file created successfully!
echo.
echo 📝 Next steps:
echo 1. Go to your Supabase dashboard → SQL Editor
echo 2. Copy and paste the contents of 'database.sql'
echo 3. Run the query to create tables and policies
echo 4. Restart your development server: npm run dev
echo.
echo 🔐 Optional: Enable Google OAuth in Authentication → Settings
echo.
echo 🎉 You're all set! Happy coding!
pause 