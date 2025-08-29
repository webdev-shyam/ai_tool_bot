import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Home, Image, FileText, Palette, CreditCard, Users, Settings, HelpCircle } from 'lucide-react'

const Sidebar = ({ open, onClose, user }) => {
  const location = useLocation()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      name: 'AI Image Generator',
      href: '/ai-image',
      icon: Image,
      description: 'Generate images from text'
    },
    {
      name: 'PDF Tools',
      href: '/pdf-tools',
      icon: FileText,
      description: 'Convert and merge PDFs'
    },
    {
      name: 'Image Tools',
      href: '/image-tools',
      icon: Palette,
      description: 'Process and convert images'
    },
    {
      name: 'Credits',
      href: '/credits',
      icon: CreditCard,
      description: 'Manage your credits'
    }
  ]

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        } md:hidden`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:shadow-none`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-telegram-400 to-telegram-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName || user.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.remainingCredits} credits remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  active ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                <div className="flex-1">
                  <span>{item.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Link
              to="/help"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <HelpCircle className="mr-3 h-4 w-4" />
              Help & Support
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </div>
          
          {/* Referral section */}
          {user && (
            <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-telegram-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Refer Friends</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Invite friends and earn 20 credits each!
              </p>
              <div className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-700">
                {user.referralCode}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
