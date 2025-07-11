# 🚀 Kanban Pro - Supabase Features Demo

A modern Kanban board built with **Next.js 15** and **Supabase** that showcases the **TOP 6 SUPABASE FEATURES** every developer should know!


📹 Full YouTube Guide: [Youtube link](https://www.youtube.com/watch?v=ad1BxZufer8&list=PLE9hy4A7ZTmpGq7GHf5tgGFWh2277AeDR&index=8)

🚀 X Post: [X link](https://x.com/ShenSeanChen/status/1895163913161109792](https://x.com/ShenSeanChen/status/1941531851299926161)

💻　Launch Full Stack Product: [Github Repo](https://github.com/ShenSeanChen/launch-mvp-stripe-nextjs-supabase)

☕️ Buy me a coffee: [Cafe Latte](https://buy.stripe.com/5kA176bA895ggog4gh)

## 🎯 Top 6 Supabase Features Demonstrated

### 1. **🔐 Authentication with OAuth**
- **Google OAuth** integration
- Session management with real-time auth state
- Secure user context throughout the app
- **Code Location**: `src/contexts/AuthContext.tsx`, `src/components/LoginForm.tsx`

### 2. **🛡️ Row Level Security (RLS)**
- Users can only see their own boards, lists, and cards
- Database-level security policies
- Multi-tenant architecture ready
- **Code Location**: `database.sql` (RLS policies)

### 3. **🔄 Real-time Subscriptions**
- Live updates when cards are moved
- Multiple users can collaborate instantly
- No polling needed - uses WebSockets
- **Code Location**: `src/components/KanbanBoard.tsx` (setupRealtimeSubscriptions)

### 4. **⚡ Auto-generated REST APIs**
- No backend coding needed
- Full CRUD operations with TypeScript
- Automatic API documentation
- **Code Location**: `src/lib/supabase.ts`, `src/components/KanbanBoard.tsx`

### 5. **🔧 Database Functions & Triggers**
- Auto-updating timestamps
- Data validation at database level
- Custom business logic in PostgreSQL
- **Code Location**: `database.sql` (update_updated_at_column function)

### 6. **🚀 Edge Functions (Serverless)**
- Custom server-side logic without managing servers
- Automatic notifications when tasks are completed
- External API integrations (email, Slack, webhooks)
- **Code Location**: `supabase/functions/task-completion-notification/`, `src/components/KanbanBoard.tsx` (triggerCompletionNotification)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Installation

### Prerequisites
- Node.js 18+
- A Supabase account (free tier works!)

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd supabase-kanban
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up Supabase

#### Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

#### Get your credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**

#### Set up environment variables

**Option 1: Use the setup script (Recommended)**
\`\`\`bash
# For Mac/Linux
./create-env.sh

# For Windows
create-env.bat
\`\`\`

**Option 2: Manual setup**
1. Create a `.env.local` file in the root directory:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

> **Note**: The app will show a configuration warning until you set up your environment variables properly.

### 4. Set up the database

#### Run the SQL schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database.sql`
4. Run the query

> **Note**: The database schema will create tables and policies. Sample data will be automatically created when you first log in to the app.

#### Enable Google OAuth (Optional)
1. Go to **Authentication** → **Settings**
2. Add Google as a provider
3. Configure OAuth settings

### 5. Deploy the Edge Function (Optional)
To enable task completion notifications:

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Deploy the edge function
supabase functions deploy task-completion-notification
\`\`\`

### 6. Run the development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser!

### 7. Test the Edge Function
1. Create a card in any list
2. Drag it to the "Done" list
3. Check your browser console for the notification message
4. In production, this would send actual emails/notifications

## 🎬 YouTube Tutorial Walkthrough

This project is perfect for demonstrating:

### **Part 1: Setup & Authentication (5 minutes)**
- Project setup and dependencies
- Supabase project creation
- Google OAuth configuration
- Authentication flow demonstration

### **Part 2: Database & RLS (8 minutes)**
- Database schema explanation
- Row Level Security policies
- How RLS protects user data
- Multi-tenant architecture benefits

### **Part 3: Real-time Features (7 minutes)**
- Setting up real-time subscriptions
- WebSocket connections
- Live collaboration demo
- Performance considerations

### **Part 4: API & TypeScript (5 minutes)**
- Auto-generated APIs
- TypeScript integration
- CRUD operations
- Error handling

### **Part 5: Advanced Features (5 minutes)**
- Database functions and triggers
- Drag and drop implementation
- UI/UX best practices
- Deployment tips

## 🔧 Database Schema

\`\`\`sql
-- Three main tables with relationships
boards (id, title, description, user_id, timestamps)
├── lists (id, title, board_id, position, timestamps)
    ├── cards (id, title, description, list_id, position, timestamps)
\`\`\`

## 🚀 Key Features

- **Drag & Drop**: Intuitive card movement between lists
- **Real-time Updates**: See changes instantly across all devices
- **Secure**: RLS ensures users only see their own data
- **Responsive**: Works on desktop and mobile
- **Type-safe**: Full TypeScript support
- **Modern UI**: Clean, professional design

## 🎨 UI Components

- **LoginForm**: Google OAuth integration
- **KanbanBoard**: Main board interface
- **AuthContext**: Global authentication state
- **Real-time subscriptions**: Live data updates

## 📝 Environment Variables

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure authentication
- **OAuth Integration**: No password storage needed
- **Real-time Authorization**: RLS works with real-time subscriptions

## 📊 Performance Optimizations

- **Optimistic Updates**: Instant UI feedback
- **Efficient Queries**: Only fetch necessary data
- **Real-time Subscriptions**: WebSocket connections
- **TypeScript**: Compile-time error checking

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

## 🤝 Contributing

This project is designed for educational purposes. Feel free to:
- Fork and modify
- Create issues
- Submit pull requests
- Use in your own tutorials

## 📄 License

MIT License - use this project however you'd like!

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React DnD](https://react-dnd.github.io/react-dnd/)

## 🎯 What You'll Learn

By following this tutorial, you'll understand:
- How to set up Supabase with Next.js
- Database design with PostgreSQL
- Real-time subscriptions
- Row Level Security implementation
- OAuth authentication
- Modern React patterns
- TypeScript best practices

Perfect for intermediate developers wanting to level up their full-stack skills! 🚀

## 🔧 Troubleshooting

### "supabaseUrl is required" Error

If you see this error, it means your environment variables aren't set up:

1. **Create `.env.local` file** in the root directory
2. **Add your Supabase credentials**:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   \`\`\`
3. **Restart your development server**
4. **Or use the setup script**: `./create-env.sh` (Mac/Linux) or `create-env.bat` (Windows)

### Common Issues

- **App shows "Configure Supabase First"**: Environment variables not set
- **OAuth not working**: Enable Google provider in Supabase dashboard
- **Database errors**: Run the `database.sql` script in your SQL Editor
- **Build errors**: Make sure all environment variables are set
- **"null value in column user_id" error**: This means you're trying to run sample data SQL without authentication. Use the main `database.sql` script instead - sample data will be created automatically when you first log in.

### Need Help?

- Check `SETUP.md` for detailed setup instructions
- Visit [Supabase Documentation](https://supabase.com/docs)
- Ensure you're using the correct project URL and anon key
