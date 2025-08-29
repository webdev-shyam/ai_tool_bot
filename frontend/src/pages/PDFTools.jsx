import React, { useState } from 'react'
import { FileText, Upload, Download, Merge, Sparkles, Copy } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const PDFTools = ({ user }) => {
  const [activeTab, setActiveTab] = useState('text-to-pdf')
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('document.pdf')
  const [generatedPDF, setGeneratedPDF] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pdfFiles, setPdfFiles] = useState([])
  const [mergedPDF, setMergedPDF] = useState(null)

  // Dropzone for PDF files
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setPdfFiles(prev => [...prev, ...acceptedFiles])
      toast.success(`${acceptedFiles.length} PDF file(s) added`)
    }
  })

  const handleTextToPDF = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    if (!user || user.remainingCredits <= 0) {
      toast.error('No credits remaining. Please wait until tomorrow or refer friends to earn more credits.')
      return
    }

    setLoading(true)
    setGeneratedPDF(null)

    try {
      const response = await apiService.textToPDF(text, filename)
      
      if (response.success) {
        setGeneratedPDF(response.pdf)
        toast.success('PDF generated successfully!')
      } else {
        toast.error(response.error || 'Failed to generate PDF')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please select at least 2 PDF files to merge')
      return
    }

    if (!user || user.remainingCredits <= 0) {
      toast.error('No credits remaining. Please wait until tomorrow or refer friends to earn more credits.')
      return
    }

    setLoading(true)
    setMergedPDF(null)

    try {
      const response = await apiService.mergePDFs(pdfFiles)
      
      if (response.success) {
        setMergedPDF(response.pdf)
        toast.success('PDFs merged successfully!')
      } else {
        toast.error(response.error || 'Failed to merge PDFs')
      }
    } catch (error) {
      console.error('PDF merge error:', error)
      toast.error('Failed to merge PDFs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (dataUrl, filename) => {
    apiService.downloadFile(dataUrl, filename)
    toast.success('PDF downloaded!')
  }

  const removePdfFile = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setText('')
    setFilename('document.pdf')
    setGeneratedPDF(null)
    setPdfFiles([])
    setMergedPDF(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Tools</h1>
            <p className="text-gray-600">Convert text to PDF and merge multiple PDF files</p>
          </div>
        </div>

        {/* Credits Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {user?.remainingCredits || 0} credits remaining
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Each operation uses 1 credit
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Free and easy to use
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('text-to-pdf')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'text-to-pdf'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Text to PDF
          </button>
          <button
            onClick={() => setActiveTab('merge-pdfs')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'merge-pdfs'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Merge PDFs
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'text-to-pdf' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Text to PDF</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="document.pdf"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to PDF..."
                    className="input-field min-h-[200px] resize-none"
                    rows={8}
                  />
                </div>

                <button
                  onClick={handleTextToPDF}
                  disabled={loading || !text.trim() || (user && user.remainingCredits <= 0)}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• The text will be formatted with proper line breaks</li>
                <li>• Long text will be automatically paginated</li>
                <li>• Use standard fonts for best compatibility</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated PDF</h2>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="loading-spinner mb-4"></div>
                  <p className="text-gray-600">Generating your PDF...</p>
                </div>
              ) : generatedPDF ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{filename}</span>
                      <span className="text-xs text-gray-500">PDF Document</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Ready for download</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(generatedPDF, filename)}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No PDF generated yet</p>
                  <p className="text-sm text-center">
                    Enter text and click "Generate PDF" to create your document
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Merge PDFs</h2>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div
                  {...getRootProps()}
                  className={`file-upload-area ${isDragActive ? 'dragover' : ''}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the PDF files here...'
                      : 'Drag & drop PDF files here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 10 files, 10MB each
                  </p>
                </div>

                {/* File List */}
                {pdfFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Selected Files ({pdfFiles.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {pdfFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removePdfFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleMergePDFs}
                  disabled={loading || pdfFiles.length < 2 || (user && user.remainingCredits <= 0)}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Merging PDFs...</span>
                    </>
                  ) : (
                    <>
                      <Merge className="w-4 h-4" />
                      <span>Merge PDFs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Select at least 2 PDF files to merge</li>
                <li>• Files will be merged in the order you select them</li>
                <li>• Maximum 10 files per merge</li>
                <li>• Each file must be under 10MB</li>
              </ul>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Merged PDF</h2>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="loading-spinner mb-4"></div>
                  <p className="text-gray-600">Merging your PDFs...</p>
                </div>
              ) : mergedPDF ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">merged.pdf</span>
                      <span className="text-xs text-gray-500">PDF Document</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Merge className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        {pdfFiles.length} files merged successfully
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(mergedPDF, 'merged.pdf')}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Merged PDF</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Merge className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No PDFs merged yet</p>
                  <p className="text-sm text-center">
                    Select PDF files and click "Merge PDFs" to combine them
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {(text || generatedPDF || pdfFiles.length > 0 || mergedPDF) && (
        <div className="mt-8 text-center">
          <button
            onClick={clearAll}
            className="btn-secondary"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}

export default PDFTools
