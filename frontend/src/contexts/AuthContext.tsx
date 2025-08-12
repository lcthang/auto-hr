'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: unknown; error: Error | null }>
  signInWithProvider: (provider: 'google' | 'microsoft') => Promise<{ data: unknown; error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabaseConfig = () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          const errorMsg = 'Supabase configuration is missing. Please check your environment variables.'
          console.error(errorMsg)
          setError(errorMsg)
          setLoading(false)
          return false
        }
        return true
      } catch (err) {
        const errorMsg = 'Failed to check Supabase configuration'
        console.error(errorMsg, err)
        setError(errorMsg)
        setLoading(false)
        return false
      }
    }

    // Get initial session
    const getSession = async () => {
      try {
        if (!checkSupabaseConfig()) return
        
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setError(`Session error: ${error.message}`)
        } else {
          console.log('Initial session:', session ? 'exists' : 'none', session?.user?.email)
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error)
        setError('Failed to get initial session')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email, 'User:', session?.user ? 'exists' : 'none')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null) // Clear any previous errors
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (user: User, userData: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            company: userData.company || '',
            job_title: userData.job_title || '',
            subscribe_newsletter: userData.subscribe_newsletter || false,
            is_active: true
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // If signup is successful and we have user data, create profile in database
      if (data.user && userData) {
        try {
          await createUserProfile(data.user, userData)
          console.log('User profile created successfully in database')
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError)
          // Don't throw here as the auth signup was successful
          // The user can still sign in, but their profile data might be incomplete
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      console.log('Sign in successful:', data.user?.email)
      console.log('Session data:', data.session ? 'exists' : 'none')
      
      // Immediately update local state
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }

      return { data, error: null }
    } catch (error: unknown) {
      console.error('Sign in failed:', error)
      return { data: null, error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state immediately
      setSession(null)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'microsoft') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'microsoft' ? 'azure' : 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithProvider
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}