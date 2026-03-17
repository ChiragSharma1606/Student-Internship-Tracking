import { createContext, useContext, useState, useEffect } from 'react'
import { logout as apiLogout } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const signIn = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const signOut = async () => {
    try { await apiLogout() } catch (_) {}
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
