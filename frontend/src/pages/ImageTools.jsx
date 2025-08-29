import React, { useState } from 'react'
import { Palette, Upload, Download, Compress, Resize, FileImage, Sparkles } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const ImageTools = ({ user }) => {
  const [activeTab, setActiveTab] = useState('convert')
  const [selectedFile, setSelectedFile] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageInfo, setImageInfo] = useState(null)

  // Conversion options
  const [targetFormat, setTargetFormat] = useState('png')
  
  // Compression options
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1024)
  
  // Resize options
  const [resizeWidth, setResizeWidth] = useState(512)
  const [resizeHeight, setResizeHeight] = useState(512)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  // Dropzone for image files
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0])
        setProcessedImage(null)
        setImageInfo(null)
        toast.success('Image uploaded successfully!')
      }
    }
  })

  const handleProcessImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

    if (!user || user.remainingCredits <= 0) {
      toast.error('No credits remaining. Please wait until tomorrow or refer friends to earn more credits.')
      return
    }

    setLoading(true)
    setProcessedImage(null)
    setImageInfo(null)

    try {
      let options = {}
      
      switch (activeTab) {
        case 'convert':
          options = { format: targetFormat }
          break
        case 'compress':
          options = { quality, width: maxWidth }
          break
        case 'resize':
          options = { width: resizeWidth, height: resizeHeight }
          break
        case 'info':
          // Info doesn't use credits
          break
      }

      const response = await apiService.processImage(selectedFile, activeTab, options)
      
      if (response.success) {
        if (activeTab === 'info') {
          setImageInfo(response.info)
          toast.success('Image information retrieved!')
        } else {
          setProcessedImage(response.image)
          setImageInfo({
            format: response.format,
            creditsUsed: response.creditsUsed,
            remainingCredits: response.remainingCredits,
            ...(response.compressionRatio && { compressionRatio: response.compressionRatio }),
            ...(response.originalSize && { originalSize: response.originalSize }),
            ...(response.compressedSize && { compressedSize: response.compressedSize })
          })
          toast.success('Image processed successfully!')
        }
      } else {
        toast.error(response.error || 'Failed to process image')
      }
    } catch (error) {
      console.error('Image processing error:', error)
      toast.error('Failed to process image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (processedImage) {
      const extension = imageInfo?.format || 'jpg'
      const filename = `processed-image-${Date.now()}.${extension}`
      apiService.downloadFile(processedImage, filename)
      toast.success('Image downloaded!')
    }
  }

  const clearAll = () => {
    setSelectedFile(null)
    setProcessedImage(null)
    setImageInfo(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <Palette className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image Tools</h1>
            <p className="text-gray-600">Convert, compress, and resize images with advanced processing</p>
          </div>
        </div>

        {/* Credits Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {user?.remainingCredits || 0} credits remaining
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Each operation uses 1 credit (except info)
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Multiple formats supported
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'convert', label: 'Convert Format', icon: FileImage },
            { id: 'compress', label: 'Compress', icon: Compress },
            { id: 'resize', label: 'Resize', icon: Resize },
            { id: 'info', label: 'Image Info', icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            <div
              {...getRootProps()}
              className={`file-upload-area ${isDragActive ? 'dragover' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the image here...'
                  : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports JPG, PNG, WebP, GIF • Max 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          {selectedFile && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
              
              {activeTab === 'convert' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Format
                    </label>
                    <select
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value)}
                      className="input-field"
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'compress' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Width: {maxWidth}px
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="2048"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'resize' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="maintainAspectRatio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="maintainAspectRatio" className="text-sm text-gray-700">
                      Maintain aspect ratio
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                        max="4096"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={resizeHeight}
                        onChange={(e) => setResizeHeight(parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                        max="4096"
                        disabled={maintainAspectRatio}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcessImage}
                disabled={loading || !selectedFile || (activeTab !== 'info' && user && user.remainingCredits <= 0)}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4" />
                    <span>{activeTab === 'info' ? 'Get Info' : 'Process Image'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• PNG: Best for images with transparency</li>
              <li>• JPG: Best for photos and smaller file sizes</li>
              <li>• WebP: Modern format with excellent compression</li>
              <li>• Compression: Lower quality = smaller file size</li>
              <li>• Resize: Maintain aspect ratio for best results</li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab === 'info' ? 'Image Information' : 'Processed Image'}
            </h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-600">Processing your image...</p>
              </div>
            ) : activeTab === 'info' && imageInfo ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <p className="font-medium">{imageInfo.width} × {imageInfo.height}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Format:</span>
                      <p className="font-medium">{imageInfo.format?.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">File Size:</span>
                      <p className="font-medium">{formatFileSize(imageInfo.size)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Alpha Channel:</span>
                      <p className="font-medium">{imageInfo.hasAlpha ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : processedImage ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={processedImage}
                    alt="Processed image"
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
                      {imageInfo.format && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Format:</span>
                          <span className="text-sm font-medium text-gray-900">{imageInfo.format.toUpperCase()}</span>
                        </div>
                      )}
                      {imageInfo.compressionRatio && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Compression:</span>
                          <span className="text-sm font-medium text-green-600">{imageInfo.compressionRatio}% smaller</span>
                        </div>
                      )}
                      {imageInfo.originalSize && imageInfo.compressedSize && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Size:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatFileSize(imageInfo.originalSize)} → {formatFileSize(imageInfo.compressedSize)}
                          </span>
                        </div>
                      )}
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
                <Palette className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No image processed yet</p>
                <p className="text-sm text-center">
                  Upload an image and select options to process it
                </p>
              </div>
            )}
          </div>

          {/* Success Card */}
          {processedImage && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">✨ Success!</h3>
              <p className="text-sm text-green-800 mb-3">
                Your image has been processed successfully. You can download it or process another one.
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
                  onClick={clearAll}
                  className="btn-secondary"
                >
                  Process Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageTools
