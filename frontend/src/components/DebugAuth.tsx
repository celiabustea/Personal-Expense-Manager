import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const DebugAuth: React.FC = () => {
  console.log('🔍 DebugAuth component rendering')
  
  try {
    const auth = useAuth()
    console.log('✅ DebugAuth: useAuth successful:', auth.user?.email || 'No user')
    return <div>Auth context is working! User: {auth.user?.email || 'Not logged in'}</div>
  } catch (error) {
    console.error('❌ DebugAuth: useAuth failed:', error)
    return <div>Auth context error: {error instanceof Error ? error.message : 'Unknown error'}</div>
  }
}

export default DebugAuth
