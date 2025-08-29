import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AIImageGenerator from './pages/AIImageGenerator'
import PDFTools from './pages/PDFTools'
import ImageTools from './pages/ImageTools'
import Credits from './pages/Credits'
import { useTelegram } from './hooks/useTelegram'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { initTelegram, telegram } = useTelegram()
  const { user, loading, error } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    initTelegram()
  }, [initTelegram])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Tools Bot...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Redirect to Telegram if not in Telegram Web App
  if (!telegram?.initData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-500 text-6xl mb-4">📱</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Open in Telegram</h1>
          <p className="text-gray-600">
            This Mini App is designed to work within Telegram. Please open it from your Telegram bot.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="pt-16 pb-8">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/ai-image" element={<AIImageGenerator user={user} />} />
          <Route path="/pdf-tools" element={<PDFTools user={user} />} />
          <Route path="/image-tools" element={<ImageTools user={user} />} />
          <Route path="/credits" element={<Credits user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App
