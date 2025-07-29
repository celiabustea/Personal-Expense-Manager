import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useDispatch } from 'react-redux'
import { supabase, signUp, signIn, signOut, getCurrentUser } from '../utils/supabase'
import { clearStateFromLocalStorage } from '../utils/localStorage'
import { loadUserState, clearUserState, clearAllUserStates, setupUserPersistence } from '../store'
import { 
  loadUserDataToRedux, 
  setupRealtimeSubscriptions 
} from '../utils/supabaseIntegration'
import { 
  setTransactions, 
  setSyncLoading as setTransactionSyncLoading 
} from '../store/slices/transactionsSlice'
import { 
  setBudgets, 
  setSyncLoading as setBudgetSyncLoading 
} from '../store/slices/budgetsSlice'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ data: any, error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any, error: any }>
  signOut: () => Promise<{ error: any }>
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
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const dispatch = useDispatch()

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Helper function to load user data and sync to Redux
  const loadUserDataFromSupabase = async (userId: string) => {
    if (!isHydrated) return

    try {
      console.log('🔄 Loading user data from Supabase for user:', userId)
      
      // 🚨 Ensure state is completely clean before loading
      dispatch(setTransactions([]))
      dispatch(setBudgets([]))
      
      dispatch(setTransactionSyncLoading(true))
      dispatch(setBudgetSyncLoading(true))
      
      // Load from Supabase (if tables exist)
      await loadUserDataToRedux(userId, dispatch)
      
      // Also load user-specific localStorage data
      loadUserState(userId)
      
      // Setup user-specific persistence
      setupUserPersistence(userId)
      
      dispatch(setTransactionSyncLoading(false))
      dispatch(setBudgetSyncLoading(false))
      console.log('✅ User data loaded from Supabase and localStorage for user:', userId)
    } catch (error) {
      console.error('❌ Failed to load user data:', error)
      dispatch(setTransactionSyncLoading(false))
      dispatch(setBudgetSyncLoading(false))
      
      // Fallback to localStorage only
      dispatch(setTransactions([]))
      dispatch(setBudgets([]))
      loadUserState(userId)
      setupUserPersistence(userId)
    }
  }

  useEffect(() => {
    let realtimeCleanup: (() => void) | null = null

    // Only run auth logic on the client side after hydration
    if (!isHydrated) return

    // Get initial session
    getCurrentUser().then(user => {
      console.log('🔄 Initial session check:', user?.email || 'No user')
      setUser(user)
      setLoading(false)
      
      // Load initial data if user is already logged in
      if (user) {
        loadUserDataFromSupabase(user.id)
        realtimeCleanup = setupRealtimeSubscriptions(user.id, dispatch)
      }
    })

    // 🚀 CRITICAL: Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔥 Auth Event:', event, session?.user?.email)
        setUser(session?.user || null)
        setLoading(false)

        // 🎯 AUTOMATIC PROFILE CREATION - Handle auth events properly
        if (session?.user) {
          // Create profile for new users or signed in users
          if (event === 'SIGNED_UP' as any || event === 'SIGNED_IN' as any) {
            // 🚨 CRITICAL: Completely clear all state before loading new user data
            clearAllUserStates()
            
            // Give React time to update the UI with cleared state
            await new Promise(resolve => setTimeout(resolve, 100))
            
            await createUserProfile(session.user)
            
            // Load user data after profile creation and state clearing
            await loadUserDataFromSupabase(session.user.id)
            
            // Set up real-time subscriptions
            if (realtimeCleanup) realtimeCleanup() // Clean up previous subscription
            realtimeCleanup = setupRealtimeSubscriptions(session.user.id, dispatch)
          }
        } else if (event === 'SIGNED_OUT' as any) {
          // Clean up on sign out - use comprehensive cleanup
          if (realtimeCleanup) {
            realtimeCleanup()
            realtimeCleanup = null
          }
          
          // Clear all user state completely
          clearAllUserStates()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (realtimeCleanup) realtimeCleanup()
    }
  }, [dispatch, isHydrated]) // Add isHydrated dependency

  // 🚀 SIMPLIFIED: Only create user profile (no default budgets)
  const createUserProfile = async (user: User) => {
    try {
      console.log('🔥 Checking if profile exists for:', user.email)
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', checkError)
        return
      }

      if (!existingProfile) {
        console.log('🔥 Creating new user profile...')
        
        // Create profile only (no default budgets)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError)
          return
        }

        console.log('✅ Profile created successfully')
        console.log('ℹ️ User can now create their own custom budgets')
      } else {
        console.log('✅ User profile already exists')
      }
    } catch (error) {
      console.error('❌ Error in profile creation:', error)
    }
  }

  const value = {
    user,
    loading: loading || !isHydrated, // Keep loading until hydrated
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}