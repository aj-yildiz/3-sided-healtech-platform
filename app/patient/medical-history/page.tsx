"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileUpload } from "@/components/file-upload"
import { FileText, Download, Trash2, Plus, Info } from "lucide-react"
import { format } from "date-fns"
import { getMedicalRecords, uploadMedicalRecord, deleteMedicalRecord } from "@/app/actions/patient-actions"

interface MedicalRecord {
  id: number
  patient_id: number
  record_type: string
  description: string
  file_path: string
  file_name: string
  created_at: string
}

export default function MedicalHistory() {
  const { user, userProfile } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  // Upload form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [recordType, setRecordType] = useState("")
  const [recordDescription, setRecordDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user || !userProfile) return

      try {
        const data = await getMedicalRecords(userProfile.id)
        setRecords(data || [])
        setTableExists(true)
      } catch (error: any) {
        console.error("Error fetching medical records:", error)

        // Check if the error is because the table doesn't exist
        if (
          error.message &&
          ((error.message.includes("relation") && error.message.includes("does not exist")) ||
            error.message.includes("Medical records table does not exist"))
        ) {
          setTableExists(false)
          setError("Medical records feature is currently being set up. Please check back later.")
        } else {
          setError("Failed to load medical records")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [user, userProfile])

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    console.log('[MedicalHistory] handleSubmit called', { recordType, recordDescription, selectedFile, userProfile });
    if (!tableExists) {
      setError("Medical records feature is currently being set up. Please check back later.")
      setIsDialogOpen(false)
      return
    }

    if (!recordType || !recordDescription || !selectedFile || !userProfile) {
      setError("Please fill in all fields and select a file")
      return
    }

    try {
      console.log('[MedicalHistory] calling uploadMedicalRecord...');
      await uploadMedicalRecord(userProfile.id, selectedFile, recordType, recordDescription)
      console.log('[MedicalHistory] uploadMedicalRecord success');
      // Refresh records
      const data = await getMedicalRecords(userProfile.id)
      setRecords(data || [])

      // Reset form
      setRecordType("")
      setRecordDescription("")
      setSelectedFile(null)
      setIsDialogOpen(false)
      setSuccess("Medical record uploaded successfully")
    } catch (error: any) {
      console.error("[MedicalHistory] Error uploading medical record:", error)

      // Check if the error is because the table doesn't exist
      if (
        error.message &&
        ((error.message.includes("relation") && error.message.includes("does not exist")) ||
          error.message.includes("Medical records table does not exist"))
      ) {
        setTableExists(false)
        setError("Medical records feature is currently being set up. Please check back later.")
      } else {
        setError(error.message || "Failed to upload medical record")
      }
    }
  }

  const handleDeleteRecord = async (recordId: number) => {
    if (!tableExists) {
      setError("Medical records feature is currently being set up. Please check back later.")
      return
    }

    if (!confirm("Are you sure you want to delete this record?")) return

    try {
      await deleteMedicalRecord(recordId)

      // Refresh records
      const data = await getMedicalRecords(userProfile.id)
      setRecords(data || [])

      setSuccess("Medical record deleted successfully")
    } catch (error: any) {
      console.error("Error deleting medical record:", error)
      setError(error.message || "Failed to delete medical record")
    }
  }

  const recordTypes = [
    "Lab Results",
    "Imaging Reports",
    "Consultation Notes",
    "Prescription",
    "Discharge Summary",
    "Referral Letter",
    "Insurance Document",
    "Other",
  ]

  // If the table doesn't exist, show a maintenance message
  if (!tableExists && !loading) {
    return (
      <RouteGuard allowedRoles={["patient"]}>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1 p-6">
            <div className="container">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Medical History</h1>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Database Setup Required</AlertTitle>
                <AlertDescription>
                  The medical records feature requires database setup. Please contact your administrator to run the
                  database migration script.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>
                    This feature allows you to securely store and manage your medical documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <h2 className="text-xl font-semibold mb-4">Setup Instructions for Administrators</h2>
                    <p className="text-muted-foreground mb-6">
                      To enable this feature, please run the SQL migration script located at:
                      <code className="block mt-2 p-2 bg-muted rounded-md">migrations/create-required-tables.sql</code>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      After running the migration, this feature will be immediately available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={["patient"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Medical History</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Upload Record
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="lab">Lab Results</TabsTrigger>
                <TabsTrigger value="imaging">Imaging Reports</TabsTrigger>
                <TabsTrigger value="consultation">Consultation Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="text-center py-10">Loading medical records...</div>
                ) : records.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {records.map((record) => (
                      <Card key={record.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{record.record_type}</CardTitle>
                              <CardDescription>{format(new Date(record.created_at), "MMM d, yyyy")}</CardDescription>
                            </div>
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{record.description}</p>
                          <p className="text-xs text-muted-foreground truncate mb-4">{record.file_name}</p>
                          <div className="flex justify-between">
                            <Button variant="outline" size="sm" asChild>
                              <a href={record.file_path} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Download
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any medical records yet.</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Upload Your First Record
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="lab">
                {loading ? (
                  <div className="text-center py-10">Loading lab results...</div>
                ) : records.filter((r) => r.record_type === "Lab Results").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {records
                      .filter((r) => r.record_type === "Lab Results")
                      .map((record) => (
                        <Card key={record.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{record.record_type}</CardTitle>
                                <CardDescription>{format(new Date(record.created_at), "MMM d, yyyy")}</CardDescription>
                              </div>
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{record.description}</p>
                            <p className="text-xs text-muted-foreground truncate mb-4">{record.file_name}</p>
                            <div className="flex justify-between">
                              <Button variant="outline" size="sm" asChild>
                                <a href={record.file_path} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any lab results yet.</p>
                      <Button
                        onClick={() => {
                          setRecordType("Lab Results")
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Upload Lab Results
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="imaging">
                {loading ? (
                  <div className="text-center py-10">Loading imaging reports...</div>
                ) : records.filter((r) => r.record_type === "Imaging Reports").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {records
                      .filter((r) => r.record_type === "Imaging Reports")
                      .map((record) => (
                        <Card key={record.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{record.record_type}</CardTitle>
                                <CardDescription>{format(new Date(record.created_at), "MMM d, yyyy")}</CardDescription>
                              </div>
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{record.description}</p>
                            <p className="text-xs text-muted-foreground truncate mb-4">{record.file_name}</p>
                            <div className="flex justify-between">
                              <Button variant="outline" size="sm" asChild>
                                <a href={record.file_path} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any imaging reports yet.</p>
                      <Button
                        onClick={() => {
                          setRecordType("Imaging Reports")
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Upload Imaging Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="consultation">
                {loading ? (
                  <div className="text-center py-10">Loading consultation notes...</div>
                ) : records.filter((r) => r.record_type === "Consultation Notes").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {records
                      .filter((r) => r.record_type === "Consultation Notes")
                      .map((record) => (
                        <Card key={record.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{record.record_type}</CardTitle>
                                <CardDescription>{format(new Date(record.created_at), "MMM d, yyyy")}</CardDescription>
                              </div>
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{record.description}</p>
                            <p className="text-xs text-muted-foreground truncate mb-4">{record.file_name}</p>
                            <div className="flex justify-between">
                              <Button variant="outline" size="sm" asChild>
                                <a href={record.file_path} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any consultation notes yet.</p>
                      <Button
                        onClick={() => {
                          setRecordType("Consultation Notes")
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Upload Consultation Notes
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Medical Record</DialogTitle>
                  <DialogDescription>Upload medical documents to keep track of your health history</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="record-type">Record Type *</Label>
                    <Select value={recordType} onValueChange={setRecordType}>
                      <SelectTrigger id="record-type">
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={recordDescription}
                      onChange={(e) => setRecordDescription(e.target.value)}
                      placeholder="Briefly describe this medical record"
                      rows={3}
                    />
                  </div>

                  <FileUpload
                    onUpload={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    label="Upload Document *"
                    buttonText="Select Document"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!recordType || !recordDescription || !selectedFile}>
                    Upload Record
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
