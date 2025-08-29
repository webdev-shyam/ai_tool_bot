import { useState, useEffect } from 'react'
import { useTelegram } from './useTelegram'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getUser, getInitData } = useTelegram()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)

        const telegramUser = getUser()
        const initData = getInitData()

        if (!telegramUser || !initData) {
          setError('Telegram user data not available')
          setLoading(false)
          return
        }

        // Set up API service with user data
        apiService.setUserData(telegramUser.id, initData)

        // Fetch user data from backend
        const response = await apiService.getUser()
        
        if (response.success) {
          setUser(response.user)
        } else {
          setError(response.error || 'Failed to fetch user data')
        }
      } catch (err) {
        console.error('Auth error:', err)
        setError(err.message || 'Authentication failed')
        toast.error('Failed to authenticate user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [getUser, getInitData])

  const refreshUser = async () => {
    try {
      const response = await apiService.getUser()
      if (response.success) {
        setUser(response.user)
        return response.user
      } else {
        throw new Error(response.error || 'Failed to refresh user data')
      }
    } catch (err) {
      console.error('Refresh user error:', err)
      toast.error('Failed to refresh user data')
      throw err
    }
  }

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  return {
    user,
    loading,
    error,
    refreshUser,
    updateUser
  }
}
