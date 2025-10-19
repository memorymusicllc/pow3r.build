import React, { useState } from 'react'

interface UserAuthenticationProps {
  onAuthChange: (authState: any) => void
}

/**
 * User Authentication Component
 * Mobile-first design with X-FILES integration
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates (Mobile-first)
 * - Article VI: X-FILES System
 */

const UserAuthentication: React.FC<UserAuthenticationProps> = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: '1',
        name: 'Pow3r User',
        email: 'user@pow3r.build',
        role: 'developer'
      }
      
      setIsAuthenticated(true)
      setUser(mockUser)
      onAuthChange({ isAuthenticated: true, user: mockUser, loading: false })
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    onAuthChange({ isAuthenticated: false, user: null, loading: false })
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-white text-sm">Authenticating...</span>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-white text-sm font-medium">{user.name}</p>
          <p className="text-gray-300 text-xs">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-md text-sm border border-red-500/30 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-md text-sm border border-blue-500/30 transition-colors"
    >
      Login
    </button>
  )
}

export default UserAuthentication