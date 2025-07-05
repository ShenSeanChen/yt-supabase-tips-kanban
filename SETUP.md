# 🚀 Quick Setup Guide

## Environment Variables Required

You need to create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Steps to Get Your Credentials

1. **Go to [supabase.com](https://supabase.com)** and sign up/login
2. **Create a new project** (or use an existing one)
3. **Wait for the database to be ready** (usually takes 2-3 minutes)
4. **Go to Settings → API** in your project dashboard
5. **Copy your Project URL** and **anon public key**
6. **Create `.env.local`** in the root directory with your credentials
7. **Restart your development server** (`npm run dev`)

## Database Setup

After setting up environment variables:

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `database.sql`**
4. **Run the query** to create tables and policies

> **Important**: The app will automatically create sample data when you first log in. The database schema script no longer includes sample data to avoid authentication errors.

### Optional: Add More Sample Data

If you want to add additional sample data after authentication:

1. **Log in to your app first** (to establish user context)
2. **Go to Supabase SQL Editor**
3. **Copy and paste the contents of `sample-data.sql`**
4. **Run the query** to add more sample boards and cards

## OAuth Setup (Optional)

To enable Google OAuth:

1. **Go to Authentication → Settings** in your Supabase dashboard
2. **Add Google as a provider**
3. **Configure OAuth settings**

## Need Help?

- Check the main README.md for detailed instructions
- Visit [Supabase Documentation](https://supabase.com/docs)
- The app will show placeholder content until credentials are configured

---

**Note**: The app will run with placeholder values, but you need real Supabase credentials for full functionality. 