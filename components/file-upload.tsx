"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileText, Image, File } from "lucide-react"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
  label?: string
  buttonText?: string
  className?: string
  multiple?: boolean
  onMultipleUpload?: (files: File[]) => Promise<void>
}

export function FileUpload({
  onUpload,
  onMultipleUpload,
  accept = "image/*,application/pdf",
  maxSize = 5, // 5MB default
  label = "Upload a file",
  buttonText = "Select File",
  className = "",
  multiple = false,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)

    const fileList = Array.from(files)

    // Check file size
    const oversizedFiles = fileList.filter((file) => file.size > maxSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError(`File${oversizedFiles.length > 1 ? "s" : ""} too large. Maximum size is ${maxSize}MB.`)
      return
    }

    setSelectedFiles(fileList)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      if (multiple && onMultipleUpload) {
        // Simulate progress for multiple files
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval)
              return 95
            }
            return prev + 5
          })
        }, 100)

        await onMultipleUpload(selectedFiles)

        clearInterval(interval)
        setProgress(100)
      } else {
        // Simulate progress for single file
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval)
              return 95
            }
            return prev + 5
          })
        }, 100)

        await onUpload(selectedFiles[0])

        clearInterval(interval)
        setProgress(100)
      }

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFiles([])
        setProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const clearSelectedFiles = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5" />
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5" />
    } else {
      return <File className="h-5 w-5" />
    }
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">{label}</label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {buttonText}
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              multiple={multiple}
              className="hidden"
            />

            {selectedFiles.length > 0 && (
              <Button type="button" variant="outline" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploading && <Progress value={progress} className="h-2 w-full" />}

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files:</p>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newFiles = [...selectedFiles]
                      newFiles.splice(index, 1)
                      setSelectedFiles(newFiles)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {selectedFiles.length > 1 && (
              <Button type="button" variant="outline" size="sm" onClick={clearSelectedFiles}>
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
