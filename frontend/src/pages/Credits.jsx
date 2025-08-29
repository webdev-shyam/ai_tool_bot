import React, { useState } from 'react'
import { CreditCard, Users, Sparkles, Copy, Gift, Crown, TrendingUp, Calendar } from 'lucide-react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const Credits = ({ user }) => {
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code')
      return
    }

    setLoading(true)

    try {
      const response = await apiService.applyReferralCode(referralCode)
      
      if (response.success) {
        toast.success(`Referral code applied! You earned ${response.creditsEarned} credits!`)
        setReferralCode('')
        // Refresh user data
        window.location.reload()
      } else {
        toast.error(response.error || 'Failed to apply referral code')
      }
    } catch (error) {
      console.error('Referral error:', error)
      toast.error('Failed to apply referral code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      toast.success('Referral code copied to clipboard!')
    }
  }

  const shareReferral = () => {
    if (user?.referralCode) {
      const shareText = `🎉 Join AI Tools Bot!

I'm using this amazing AI bot with powerful tools:
• 🎨 AI Image Generation
• 📄 PDF Tools
• 🖼️ Image Processing

🔑 Use my referral code: ${user.referralCode}

Get started and we both get extra credits! 🎁`

      if (navigator.share) {
        navigator.share({
          title: 'AI Tools Bot',
          text: shareText,
          url: window.location.origin
        })
      } else {
        navigator.clipboard.writeText(shareText)
        toast.success('Referral message copied to clipboard!')
      }
    }
  }

  const features = [
    {
      name: 'AI Image Generation',
      description: 'Generate stunning images from text',
      credits: 1,
      icon: '🎨'
    },
    {
      name: 'PDF Conversion',
      description: 'Convert text to PDF documents',
      credits: 1,
      icon: '📄'
    },
    {
      name: 'PDF Merging',
      description: 'Combine multiple PDF files',
      credits: 1,
      icon: '📋'
    },
    {
      name: 'Image Conversion',
      description: 'Convert between image formats',
      credits: 1,
      icon: '🔄'
    },
    {
      name: 'Image Compression',
      description: 'Reduce image file size',
      credits: 1,
      icon: '🗜️'
    },
    {
      name: 'Image Resizing',
      description: 'Resize images to any dimension',
      credits: 1,
      icon: '📏'
    }
  ]

  const premiumFeatures = [
    'Unlimited daily usage',
    'Higher resolution images (1024x1024)',
    'Advanced AI models',
    'Priority processing',
    'Batch operations',
    'Advanced formatting options',
    'Premium support'
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credits & Referrals</h1>
            <p className="text-gray-600">Manage your credits and earn more through referrals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credits Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Credits */}
          <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Current Credits</h2>
                  <p className="text-sm text-gray-600">Your daily usage and limits</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {user?.remainingCredits || 0}
                </div>
                <div className="text-sm text-gray-500">remaining</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{user?.credits || 10}</div>
                <div className="text-xs text-gray-500">Daily Limit</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{user?.dailyUsage || 0}</div>
                <div className="text-xs text-gray-500">Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{user?.referralCount || 0}</div>
                <div className="text-xs text-gray-500">Friends Referred</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next reset:</span>
                <span className="text-gray-900">Tomorrow at midnight</span>
              </div>
            </div>
          </div>

          {/* Feature Costs */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Costs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-sm text-gray-500">{feature.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-purple-600">{feature.credits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Premium Features</h2>
                <p className="text-sm text-gray-600">Coming soon with Telegram Stars</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Premium features will be available soon</p>
                <button className="btn-secondary text-sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral System */}
        <div className="space-y-6">
          {/* Your Referral Code */}
          <div className="card bg-gradient-to-r from-blue-50 to-telegram-50 border-blue-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Referral Code</h2>
                <p className="text-sm text-gray-600">Share and earn credits</p>
              </div>
            </div>

            {user?.referralCode ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono text-blue-700">{user.referralCode}</code>
                    <button
                      onClick={copyReferralCode}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="font-semibold text-blue-700">{user.referralCount || 0}</div>
                    <div className="text-blue-600">Friends Referred</div>
                  </div>
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="font-semibold text-green-700">{(user.referralCount || 0) * 20}</div>
                    <div className="text-green-600">Credits Earned</div>
                  </div>
                </div>

                <button
                  onClick={shareReferral}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Share Referral</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Referral code not available</p>
              </div>
            )}
          </div>

          {/* Apply Referral Code */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply Referral Code</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Referral Code
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  className="input-field"
                  maxLength={8}
                />
              </div>

              <button
                onClick={handleApplyReferral}
                disabled={loading || !referralCode.trim() || user?.referredBy}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Apply Code</span>
                  </>
                )}
              </button>

              {user?.referredBy && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">Referral code already applied</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="card bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How Referrals Work</h2>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-700">Share your referral code with friends</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-700">They join using your code</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-700">Both of you get 20 extra credits!</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">No limit on referrals!</p>
                <div className="text-xs text-gray-500">
                  Earn 20 credits for each friend you refer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Credits
