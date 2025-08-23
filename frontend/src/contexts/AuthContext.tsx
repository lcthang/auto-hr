'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiGatewayService, CreateProfileData } from '@/lib/api'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: unknown; error: Error | null }>
  updatePassword: (password: string) => Promise<{ data: unknown; error: Error | null }>
  handlePasswordRecovery: (accessToken: string, refreshToken: string) => Promise<{ data: unknown; error: Error | null }>
  refreshSession: () => Promise<{ data: unknown; error: Error | null }>
  signInWithProvider: (provider: 'google') => Promise<{ data: unknown; error: Error | null }>
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

        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          setError(null)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setLoading(false)
          setError(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const registerUser = async (user: User, userData: Record<string, unknown>) => {
    try {
      // Use API gateway instead of direct Supabase insertion
      const profileData: CreateProfileData = {
        id: user.id,
        email: user.email as string,
        first_name: (userData.first_name as string) || '',
        last_name: (userData.last_name as string) || '',
        company: (userData.company as string) || '',
        job_title: (userData.job_title as string) || '',
        subscribe_newsletter: (userData.subscribe_newsletter as boolean) || false,
        is_active: true
      };

      const response = await apiGatewayService.registerUser(profileData);

      if (!response.success) {
        console.error('Error creating user profile:', response.error);
        throw new Error(response.error || 'Failed to create user profile');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (error) throw error

      // If signup is successful and we have user data, create profile in database
      if (data.user && userData) {
        try {
          await registerUser(data.user, userData)
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
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const handlePasswordRecovery = async (accessToken: string, refreshToken: string) => {
    try {
      // Set the session with the recovery tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) throw error

      // Update local state
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }
      
      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: error as Error }
    }
  }

  const signInWithProvider = async (provider: 'google') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
    updatePassword,
    handlePasswordRecovery,
    refreshSession,
    signInWithProvider
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}