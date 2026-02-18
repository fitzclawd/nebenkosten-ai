'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }, [])

  const validateAndSetFile = (file: File) => {
    setError(null)
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file')
      return
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(file)
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadProgress(100)

      // Start analysis
      setTimeout(async () => {
        await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billId: data.billId,
            fileUrl: data.fileUrl
          })
        })
        
        // Redirect to verification page
        router.push(`/verify/${data.billId}`)
      }, 500)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">€</span>
            </div>
            <span className="font-bold text-xl text-slate-900">NebenkostenAI</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div className="ml-2 text-sm font-medium text-slate-900">Upload</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                2
              </div>
              <div className="ml-2 text-sm font-medium text-slate-600">Verify</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                3
              </div>
              <div className="ml-2 text-sm font-medium text-slate-600">Results</div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Your Utility Bill</CardTitle>
              <CardDescription>
                Upload your Betriebskostenabrechnung as a PDF or image. We'll analyze it for errors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-12 text-center transition-colors
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-300 hover:border-slate-400'
                    }
                  `}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-slate-500 mb-4">
                    or click to browse (PDF, JPG, PNG up to 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={clearFile}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Uploading...</span>
                        <span className="text-slate-900 font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!isUploading && !error && uploadProgress === 100 && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span>Upload complete! Analyzing your bill...</span>
                    </div>
                  )}

                  {!isUploading && uploadProgress < 100 && (
                    <Button 
                      onClick={handleUpload} 
                      className="w-full"
                      size="lg"
                    >
                      Upload and Analyze
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📄</div>
              <p className="text-sm text-slate-600">We accept PDFs and images of your bill</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm text-slate-600">Your data is securely processed and stored</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm text-slate-600">Analysis takes less than 30 seconds</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
