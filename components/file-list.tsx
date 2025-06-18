"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Image, File, Download, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"

interface FileItem {
  id: number
  name: string
  path: string
  type: string
  size?: number
  createdAt: string
  description?: string
}

interface FileListProps {
  files: FileItem[]
  onDelete: (id: number) => Promise<void>
  emptyMessage?: string
  showPreview?: boolean
}

export function FileList({ files, onDelete, emptyMessage = "No files found", showPreview = true }: FileListProps) {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getFileIcon = (type: string) => {
    if (
      type.startsWith("image/") ||
      type.endsWith(".jpg") ||
      type.endsWith(".jpeg") ||
      type.endsWith(".png") ||
      type.endsWith(".gif")
    ) {
      return <Image className="h-5 w-5" />
    } else if (type === "application/pdf" || type.endsWith(".pdf")) {
      return <FileText className="h-5 w-5" />
    } else {
      return <File className="h-5 w-5" />
    }
  }

  const handleDelete = async (id: number) => {
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error("Error deleting file:", error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  const isImage = (type: string) => {
    return (
      type.startsWith("image/") ||
      type.endsWith(".jpg") ||
      type.endsWith(".jpeg") ||
      type.endsWith(".png") ||
      type.endsWith(".gif")
    )
  }

  const isPdf = (type: string) => {
    return type === "application/pdf" || type.endsWith(".pdf")
  }

  if (files.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(file.createdAt), "MMM d, yyyy")}
                    {file.size && ` • ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {showPreview && (isImage(file.type) || isPdf(file.type)) && (
                  <Button variant="ghost" size="sm" onClick={() => setPreviewFile(file)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" asChild>
                  <a href={file.path} target="_blank" rel="noopener noreferrer" download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>

                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(file.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {file.description && <p className="text-sm text-muted-foreground mt-2">{file.description}</p>}
          </CardContent>
        </Card>
      ))}

      {/* File Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
              <DialogDescription>{previewFile.description || "File preview"}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {isImage(previewFile.type) ? (
                <img
                  src={previewFile.path || "/placeholder.svg"}
                  alt={previewFile.name}
                  className="max-h-[500px] mx-auto object-contain"
                />
              ) : isPdf(previewFile.type) ? (
                <iframe src={`${previewFile.path}#toolbar=0`} className="w-full h-[500px]" title={previewFile.name} />
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button asChild>
                <a href={previewFile.path} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
