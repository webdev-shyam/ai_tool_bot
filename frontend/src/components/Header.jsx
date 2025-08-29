import React from 'react'
import { Menu, User, Sparkles } from 'lucide-react'

const Header = ({ user, onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">AI Tools</h1>
          </div>
        </div>

        {/* Right side - User info and credits */}
        <div className="flex items-center space-x-3">
          {user && (
            <>
              {/* Credits display */}
              <div className="hidden sm:flex items-center space-x-2 bg-primary-50 px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {user.remainingCredits} credits
                </span>
              </div>

              {/* User info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-telegram-400 to-telegram-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.dailyUsage}/{user.credits} used today
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Mobile credits badge */}
          {user && (
            <div className="sm:hidden flex items-center space-x-1 bg-primary-100 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">
                {user.remainingCredits}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
