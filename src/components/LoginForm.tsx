'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogIn } from 'lucide-react'

export default function LoginForm() {
  const { signInWithGoogle, loading } = useAuth()

  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kanban Pro
          </h1>
          <p className="text-gray-600">
            Sign in to manage your projects with style
          </p>
        </div>

        <div className="space-y-4">
          {!isSupabaseConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-yellow-600">⚠️</div>
                <p className="text-sm font-medium text-yellow-800">
                  Supabase Not Configured
                </p>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Please set up your Supabase credentials in <code className="bg-yellow-100 px-1 rounded">.env.local</code>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Check <code className="bg-yellow-100 px-1 rounded">SETUP.md</code> for instructions
              </p>
            </div>
          )}
          
          <button
            onClick={signInWithGoogle}
            disabled={loading || !isSupabaseConfigured}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading 
              ? 'Signing in...' 
              : !isSupabaseConfigured 
                ? 'Configure Supabase First' 
                : 'Continue with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isSupabaseConfigured ? "Demo Mode: Continue as guest" : "Set up Supabase to get started"}
            </p>
            {isSupabaseConfigured && (
              <button
                onClick={() => {/* We'll implement guest mode later */}}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Continue as Guest
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Built with Next.js + Supabase
          </p>
        </div>
      </div>
    </div>
  )
} 