import React, { useState } from 'react'
import { Image, Download, Sparkles, Lightbulb, Copy } from 'lucide-react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const AIImageGenerator = ({ user }) => {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageInfo, setImageInfo] = useState(null)

  const examplePrompts = [
    'A beautiful sunset over mountains with a lake in the foreground',
    'A cute cat playing with yarn in a cozy living room',
    'A futuristic city skyline at night with flying cars',
    'A magical forest with glowing mushrooms and fairy lights',
    'A steampunk robot in a Victorian workshop',
    'A peaceful beach scene with palm trees and crystal clear water'
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the image')
      return
    }

    if (!user || user.remainingCredits <= 0) {
      toast.error('No credits remaining. Please wait until tomorrow or refer friends to earn more credits.')
      return
    }

    setLoading(true)
    setGeneratedImage(null)
    setImageInfo(null)

    try {
      const response = await apiService.generateImage(prompt)
      
      if (response.success) {
        setGeneratedImage(response.image)
        setImageInfo({
          prompt: response.prompt,
          creditsUsed: response.creditsUsed,
          remainingCredits: response.remainingCredits
        })
        toast.success('Image generated successfully!')
      } else {
        toast.error(response.error || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      apiService.downloadFile(generatedImage, `ai-generated-${Date.now()}.png`)
      toast.success('Image downloaded!')
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copied to clipboard!')
  }

  const handleExampleClick = (examplePrompt) => {
    setPrompt(examplePrompt)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <Image className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Image Generator</h1>
            <p className="text-gray-600">Generate stunning images from text descriptions using Stable Diffusion AI</p>
          </div>
        </div>

        {/* Credits Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {user?.remainingCredits || 0} credits remaining
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Each generation uses 1 credit
              </span>
            </div>
            <div className="text-sm text-gray-500">
              512x512 resolution • Free tier
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Image Description</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate. Be specific and detailed for better results..."
                  className="input-field min-h-[120px] resize-none"
                  rows={4}
                />
                {prompt && (
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy prompt"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || (user && user.remainingCredits <= 0)}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Example Prompts</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Be specific about style, colors, and composition</li>
              <li>• Include details about lighting and mood</li>
              <li>• Mention artistic styles (e.g., "oil painting", "digital art")</li>
              <li>• Specify camera angles (e.g., "close-up", "wide shot")</li>
              <li>• Add descriptive adjectives for better quality</li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Image */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Image</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-600">Generating your image...</p>
                <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <button
                      onClick={handleDownload}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                {imageInfo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Prompt:</span>
                        <span className="text-sm font-medium text-gray-900 max-w-xs truncate" title={imageInfo.prompt}>
                          {imageInfo.prompt}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Credits used:</span>
                        <span className="text-sm font-medium text-gray-900">{imageInfo.creditsUsed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Remaining credits:</span>
                        <span className="text-sm font-medium text-green-600">{imageInfo.remainingCredits}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Image className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No image generated yet</p>
                <p className="text-sm text-center">
                  Enter a description and click "Generate Image" to create your first AI image
                </p>
              </div>
            )}
          </div>

          {/* Image Info Card */}
          {generatedImage && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">✨ Success!</h3>
              <p className="text-sm text-green-800 mb-3">
                Your image has been generated successfully. You can download it or generate another one.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage(null)
                    setImageInfo(null)
                    setPrompt('')
                  }}
                  className="btn-secondary"
                >
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIImageGenerator
