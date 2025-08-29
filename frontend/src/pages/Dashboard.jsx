import React from 'react'
import { Link } from 'react-router-dom'
import { Image, FileText, Palette, Sparkles, TrendingUp, Users, Download } from 'lucide-react'

const Dashboard = ({ user }) => {
  const tools = [
    {
      name: 'AI Image Generator',
      description: 'Generate stunning images from text descriptions using AI',
      icon: Image,
      href: '/ai-image',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      features: ['Stable Diffusion AI', '512x512 resolution', 'Free tier available']
    },
    {
      name: 'PDF Tools',
      description: 'Convert text to PDF and merge multiple PDF files',
      icon: FileText,
      href: '/pdf-tools',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      features: ['Text to PDF', 'PDF merging', 'Easy to use']
    },
    {
      name: 'Image Tools',
      description: 'Convert, compress, and resize images with advanced processing',
      icon: Palette,
      href: '/image-tools',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      features: ['Format conversion', 'Image compression', 'Resize images']
    }
  ]

  const stats = [
    {
      name: 'Credits Remaining',
      value: user?.remainingCredits || 0,
      icon: Sparkles,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      name: 'Daily Usage',
      value: `${user?.dailyUsage || 0}/${user?.credits || 10}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Friends Referred',
      value: user?.referralCount || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || user?.username || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Choose a tool below to get started with AI-powered features
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tools Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.name}
                to={tool.href}
                className="card tool-card group hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {tool.description}
                </p>
                
                <div className="space-y-1">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-500">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Section */}
        <div className="card bg-gradient-to-r from-primary-50 to-telegram-50">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              Refer Friends & Earn Credits
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Share your referral code with friends and both of you will receive 20 extra credits!
          </p>
          
          {user?.referralCode && (
            <div className="bg-white p-3 rounded-lg border border-primary-200">
              <p className="text-xs text-gray-500 mb-1">Your Referral Code:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-primary-700 bg-primary-50 px-2 py-1 rounded">
                  {user.referralCode}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(user.referralCode)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Credits Info */}
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              Credits System
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Limit:</span>
              <span className="font-medium">{user?.credits || 10} requests</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used Today:</span>
              <span className="font-medium">{user?.dailyUsage || 0} requests</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-medium text-green-600">
                {user?.remainingCredits || 0} credits
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-xs text-gray-500">
              Credits reset daily at midnight. Refer friends to earn more!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
