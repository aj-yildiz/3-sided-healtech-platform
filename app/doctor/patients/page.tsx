"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getDoctorProfile,
  getDoctorPatients,
  getPatientAppointmentHistory,
  getPatientNotes,
  addPatientNote,
  getMedicalDocuments,
  uploadMedicalDocument,
  deleteMedicalDocument,
} from "@/app/actions/doctor-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/loading-screen"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"
import { User, Phone, Mail, Calendar, FileText, Clock, MapPin, Search } from "lucide-react"
import moment from "moment"
import { Badge } from "@/components/ui/badge"

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientHistory, setPatientHistory] = useState([])
  const [patientNotes, setPatientNotes] = useState([])
  const [patientDocuments, setPatientDocuments] = useState([])
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const doctorData = await getDoctorProfile(user.id)
        if (doctorData) {
          setDoctor(doctorData)
          const patientsData = await getDoctorPatients(doctorData.id)
          setPatients(patientsData)
        }
      } catch (error) {
        console.error("Error loading doctor data:", error)
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients

    const query = searchQuery.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(query),
    )
  }, [patients, searchQuery])

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient)

    try {
      // Load patient appointment history
      const history = await getPatientAppointmentHistory(doctor.id, patient.id)
      setPatientHistory(history)

      // Load patient notes
      const notes = await getPatientNotes(doctor.id, patient.id)
      setPatientNotes(notes)

      // Load patient documents
      const documents = await getMedicalDocuments(doctor.id, patient.id)
      setPatientDocuments(documents)
    } catch (error) {
      console.error("Error loading patient details:", error)
      toast({
        title: "Error",
        description: "Failed to load patient details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      await addPatientNote(doctor.id, selectedPatient.id, newNote)

      // Refresh notes
      const notes = await getPatientNotes(doctor.id, selectedPatient.id)
      setPatientNotes(notes)

      setNewNote("")
      toast({
        title: "Note Added",
        description: "Patient note has been added successfully",
      })
    } catch (error) {
      console.error("Error adding patient note:", error)
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingNote(false)
    }
  }

  const handleDocumentUpload = async (file) => {
    if (!file) return

    setUploadingDocument(true)
    try {
      await uploadMedicalDocument(doctor.id, selectedPatient.id, file, "medical_record")

      // Refresh documents
      const documents = await getMedicalDocuments(doctor.id, selectedPatient.id)
      setPatientDocuments(documents)

      toast({
        title: "Document Uploaded",
        description: "Medical document has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingDocument(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!doctor) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor Profile Not Found</h1>
        <p>Please complete your profile setup to view patients.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Patients</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Patients</CardTitle>
              <CardDescription>
                {patients.length} {patients.length === 1 ? "patient" : "patients"} in total
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  {searchQuery ? "No patients match your search" : "No patients found"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="md:col-span-2">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedPatient.name}</CardTitle>
                <CardDescription>Patient ID: {selectedPatient.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">Patient Info</TabsTrigger>
                    <TabsTrigger value="history">Appointment History</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" /> Personal Information
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Full Name:</span>
                            <p>{selectedPatient.name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <p>{selectedPatient.email}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <p>{selectedPatient.phone}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Date of Birth:</span>
                            <p>
                              {selectedPatient.date_of_birth
                                ? moment(selectedPatient.date_of_birth).format("MMMM D, YYYY")
                                : "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Gender:</span>
                            <p>{selectedPatient.gender || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Medical Information
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Medical History:</span>
                            <p>{selectedPatient.medical_history || "None provided"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Allergies:</span>
                            <p>{selectedPatient.allergies || "None provided"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Current Medications:</span>
                            <p>{selectedPatient.current_medications || "None provided"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Current Conditions:</span>
                            <p>{selectedPatient.current_conditions || "None provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    {patientHistory.length === 0 ? (
                      <div className="text-center p-6 bg-muted rounded-lg">
                        <p>No appointment history found for this patient.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {patientHistory.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">
                                  {appointment.service_types?.name || appointment.appointment_type}
                                </CardTitle>
                                <Badge
                                  className={`
                                  ${
                                    appointment.appointment_status === "completed"
                                      ? "bg-green-500"
                                      : appointment.appointment_status === "scheduled"
                                        ? "bg-blue-500"
                                        : appointment.appointment_status === "cancelled"
                                          ? "bg-red-500"
                                          : "bg-amber-500"
                                  } text-white`}
                                >
                                  {appointment.appointment_status.charAt(0).toUpperCase() +
                                    appointment.appointment_status.slice(1)}
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {moment(appointment.appointment_date).format("MMMM D, YYYY")}
                                <Clock className="h-4 w-4 ml-2" />
                                {moment(appointment.appointment_time, "HH:mm:ss").format("h:mm A")}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium">{appointment.gyms.name}</div>
                                  <div className="text-sm text-muted-foreground">{appointment.gyms.address}</div>
                                </div>
                              </div>
                              {appointment.appointment_notes && (
                                <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                  <div className="font-medium">Notes:</div>
                                  <p>{appointment.appointment_notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-medium mb-2">Add New Note</h3>
                        <Textarea
                          placeholder="Enter your notes about this patient..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={4}
                        />
                        <Button onClick={handleAddNote} className="mt-2" disabled={addingNote || !newNote.trim()}>
                          {addingNote ? "Adding..." : "Add Note"}
                        </Button>
                      </div>

                      {patientNotes.length === 0 ? (
                        <div className="text-center p-6 bg-muted rounded-lg">
                          <p>No notes found for this patient.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientNotes.map((note) => (
                            <Card key={note.id}>
                              <CardHeader className="pb-2">
                                <CardDescription>
                                  {moment(note.created_at).format("MMMM D, YYYY [at] h:mm A")}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p>{note.note}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-medium mb-2">Upload New Document</h3>
                        <FileUpload
                          onUpload={handleDocumentUpload}
                          isUploading={uploadingDocument}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          maxSize={5 * 1024 * 1024} // 5MB
                        />
                      </div>

                      {patientDocuments.length === 0 ? (
                        <div className="text-center p-6 bg-muted rounded-lg">
                          <p>No documents found for this patient.</p>
                        </div>
                      ) : (
                        <FileList
                          files={patientDocuments}
                          onDelete={async (id) => {
                            try {
                              await deleteMedicalDocument(id)
                              // Refresh documents
                              const documents = await getMedicalDocuments(doctor.id, selectedPatient.id)
                              setPatientDocuments(documents)
                              toast({
                                title: "Document Deleted",
                                description: "Medical document has been deleted successfully",
                              })
                            } catch (error) {
                              console.error("Error deleting document:", error)
                              toast({
                                title: "Error",
                                description: "Failed to delete document. Please try again.",
                                variant: "destructive",
                              })
                            }
                          }}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
                <p className="text-muted-foreground">
                  Select a patient from the list to view their details, appointment history, and medical records.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
