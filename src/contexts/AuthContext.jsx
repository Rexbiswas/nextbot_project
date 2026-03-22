import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'nextbot_session'
const API_BASE = 'http://localhost:3002/api'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY)
      if (s) setSession(JSON.parse(s))
    } catch (e) {
      console.error('Failed to load session', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSession = useCallback((sessionData) => {
    if (sessionData) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
      setSession(sessionData)
    } else {
      localStorage.removeItem(SESSION_KEY)
      setSession(null)
    }
  }, [])

  const register = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) return { success: true, message: 'Registration successful' }
      return { success: false, message: data.error || 'Registration failed' }
    } catch (e) {
      return { success: false, message: 'Server error during registration' }
    }
  }

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        saveSession(data)
        return { success: true, message: 'Login successful' }
      }
      return { success: false, message: data.error || 'Login failed' }
    } catch (e) {
      return { success: false, message: 'Server error during login' }
    }
  }

  const logout = () => {
    saveSession(null)
    return { success: true }
  }

  const updateSettings = async (newSettings) => {
    if (!session) return { success: false, message: 'Not logged in' }
    try {
      const res = await fetch(`${API_BASE}/user/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(newSettings)
      })
      const data = await res.json()
      if (res.ok) {
        const updated = { ...session, settings: data }
        saveSession(updated)
        return { success: true, settings: data }
      }
      return { success: false, message: 'Failed to update settings' }
    } catch (e) {
      return { success: false, message: 'Server error updating settings' }
    }
  }

  const registerFace = async (descriptor) => {
    if (!session) return { success: false, message: 'Not logged in' }
    try {
      const res = await fetch(`${API_BASE}/user/face`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ descriptor: Array.from(descriptor) })
      })
      if (res.ok) return { success: true, message: 'Face data saved to cloud' }
      return { success: false, message: 'Failed to save face data' }
    } catch (e) {
      return { success: false, message: 'Server error' }
    }
  }

  const verifyFace = async (descriptor) => {
    try {
      const res = await fetch(`${API_BASE}/login/face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(descriptor) })
      })
      const data = await res.json()
      if (res.ok) {
        saveSession(data)
        return { success: true, message: 'Face recognized!' }
      }
      return { success: false, message: 'Face not recognized' }
    } catch (e) {
      return { success: false, message: 'Face login error' }
    }
  }

  const getVoiceSettings = () => {
    const s = session?.settings || {}
    return {
      rate: s.voiceRate ?? 1,
      pitch: s.voicePitch ?? 1,
      volume: s.voiceVolume ?? 1,
      language: s.language || 'en-US'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoggedIn: !!session,
        loading,
        getCurrentUser: () => session,
        getToken: () => session?.token,
        register,
        login,
        logout,
        updateSettings,
        registerFace,
        verifyFace,
        getVoiceSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
