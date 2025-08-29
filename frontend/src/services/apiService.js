import axios from 'axios'
import toast from 'react-hot-toast'

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    this.telegramId = null
    this.initData = null
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.telegramId) {
          config.headers['x-telegram-id'] = this.telegramId
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        console.error('API Error:', error)
        
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 401:
              toast.error('Authentication failed. Please refresh the app.')
              break
            case 403:
              toast.error(data.error || 'No credits remaining')
              break
            case 404:
              toast.error('Service not found')
              break
            case 429:
              toast.error('Too many requests. Please wait a moment.')
              break
            case 500:
              toast.error('Server error. Please try again later.')
              break
            default:
              toast.error(data.error || 'Something went wrong')
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.')
        } else {
          toast.error('Request failed')
        }
        
        return Promise.reject(error)
      }
    )
  }

  setUserData(telegramId, initData) {
    this.telegramId = telegramId
    this.initData = initData
  }

  // User endpoints
  async getUser() {
    try {
      return await this.api.get('/user')
    } catch (error) {
      throw error
    }
  }

  // AI Image Generation
  async generateImage(prompt) {
    try {
      return await this.api.post('/ai-image', { prompt })
    } catch (error) {
      throw error
    }
  }

  // PDF Tools
  async textToPDF(text, filename = 'document.pdf') {
    try {
      return await this.api.post('/text-to-pdf', { text, filename })
    } catch (error) {
      throw error
    }
  }

  async mergePDFs(files) {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append('pdfs', file)
      })
      
      return await this.api.post('/merge-pdfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error) {
      throw error
    }
  }

  // Image Tools
  async processImage(file, action, options = {}) {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('action', action)
      
      // Add options to form data
      Object.keys(options).forEach(key => {
        formData.append(key, options[key])
      })
      
      return await this.api.post('/image-process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error) {
      throw error
    }
  }

  // Referral
  async applyReferralCode(referralCode) {
    try {
      return await this.api.post('/referral', { referralCode })
    } catch (error) {
      throw error
    }
  }

  // Health check
  async healthCheck() {
    try {
      return await this.api.get('/health')
    } catch (error) {
      throw error
    }
  }

  // Utility methods
  downloadFile(dataUrl, filename) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type })
  }
}

export const apiService = new ApiService()
