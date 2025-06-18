"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Plus } from "lucide-react"

interface Treatment {
  id: number
  name: string
  description: string
  duration: number
  price: number
  is_online_available: boolean
  is_in_person: boolean
  doctor_id: number
}

export default function DoctorTreatments() {
  const { user, userProfile } = useAuth()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // New treatment form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [treatmentName, setTreatmentName] = useState("")
  const [treatmentDescription, setTreatmentDescription] = useState("")
  const [treatmentDuration, setTreatmentDuration] = useState("60")
  const [treatmentPrice, setTreatmentPrice] = useState("")
  const [isOnlineAvailable, setIsOnlineAvailable] = useState(false)
  const [isInPerson, setIsInPerson] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchTreatments = async () => {
      if (!user || !userProfile) return

      try {
        const { data, error } = await supabase
          .from("treatments")
          .select("*")
          .eq("doctor_id", userProfile.id)
          .order("name", { ascending: true })

        if (error) throw error

        setTreatments(data || [])
      } catch (error) {
        console.error("Error fetching treatments:", error)
        setError("Failed to load treatments")
      } finally {
        setLoading(false)
      }
    }

    fetchTreatments()
  }, [user, userProfile, supabase])

  const resetForm = () => {
    setTreatmentName("")
    setTreatmentDescription("")
    setTreatmentDuration("60")
    setTreatmentPrice("")
    setIsOnlineAvailable(false)
    setIsInPerson(true)
    setEditingTreatment(null)
  }

  const openEditDialog = (treatment: Treatment) => {
    setEditingTreatment(treatment)
    setTreatmentName(treatment.name)
    setTreatmentDescription(treatment.description || "")
    setTreatmentDuration(treatment.duration.toString())
    setTreatmentPrice(treatment.price.toString())
    setIsOnlineAvailable(treatment.is_online_available)
    setIsInPerson(treatment.is_in_person)
    setIsDialogOpen(true)
  }

  const handleSaveTreatment = async () => {
    if (!treatmentName || !treatmentDuration || !treatmentPrice) {
      setError("Please fill in all required fields")
      return
    }

    if (!isInPerson && !isOnlineAvailable) {
      setError("Treatment must be available either in-person or online")
      return
    }

    if (!userProfile) return

    setError(null)
    setSuccess(null)

    try {
      const treatmentData = {
        name: treatmentName,
        description: treatmentDescription,
        duration: Number.parseInt(treatmentDuration),
        price: Number.parseFloat(treatmentPrice),
        is_online_available: isOnlineAvailable,
        is_in_person: isInPerson,
        doctor_id: userProfile.id,
      }

      let result

      if (editingTreatment) {
        // Update existing treatment
        const { data, error } = await supabase
          .from("treatments")
          .update(treatmentData)
          .eq("id", editingTreatment.id)
          .select()
          .single()

        if (error) throw error
        result = data

        // Update local state
        setTreatments((prev) => prev.map((t) => (t.id === editingTreatment.id ? result : t)))

        setSuccess("Treatment updated successfully")
      } else {
        // Create new treatment
        const { data, error } = await supabase.from("treatments").insert(treatmentData).select().single()

        if (error) throw error
        result = data

        // Update local state
        setTreatments((prev) => [...prev, result])

        setSuccess("Treatment created successfully")
      }

      // Close dialog and reset form
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving treatment:", error)
      setError("Failed to save treatment")
    }
  }

  const handleDeleteTreatment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return

    try {
      const { error } = await supabase.from("treatments").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setTreatments((prev) => prev.filter((t) => t.id !== id))

      setSuccess("Treatment deleted successfully")
    } catch (error) {
      console.error("Error deleting treatment:", error)
      setError("Failed to delete treatment")
    }
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Treatments & Services</h1>
              <Button
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Treatment
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
                <TabsTrigger value="all">All Treatments</TabsTrigger>
                <TabsTrigger value="in-person">In-Person</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="text-center py-10">Loading treatments...</div>
                ) : treatments.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {treatments.map((treatment) => (
                      <Card key={treatment.id}>
                        <CardHeader className="pb-2">
                          <CardTitle>{treatment.name}</CardTitle>
                          <CardDescription>
                            {treatment.duration} minutes • ${treatment.price.toFixed(2)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {treatment.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {treatment.is_in_person && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                In-Person
                              </span>
                            )}
                            {treatment.is_online_available && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Online</span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTreatment(treatment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(treatment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You haven't created any treatments yet.</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Treatment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="in-person">
                {loading ? (
                  <div className="text-center py-10">Loading treatments...</div>
                ) : treatments.filter((t) => t.is_in_person).length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {treatments
                      .filter((t) => t.is_in_person)
                      .map((treatment) => (
                        <Card key={treatment.id}>
                          <CardHeader className="pb-2">
                            <CardTitle>{treatment.name}</CardTitle>
                            <CardDescription>
                              {treatment.duration} minutes • ${treatment.price.toFixed(2)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              {treatment.description || "No description provided."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                In-Person
                              </span>
                              {treatment.is_online_available && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                  Online
                                </span>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTreatment(treatment.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(treatment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any in-person treatments.</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add In-Person Treatment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="online">
                {loading ? (
                  <div className="text-center py-10">Loading treatments...</div>
                ) : treatments.filter((t) => t.is_online_available).length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {treatments
                      .filter((t) => t.is_online_available)
                      .map((treatment) => (
                        <Card key={treatment.id}>
                          <CardHeader className="pb-2">
                            <CardTitle>{treatment.name}</CardTitle>
                            <CardDescription>
                              {treatment.duration} minutes • ${treatment.price.toFixed(2)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              {treatment.description || "No description provided."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {treatment.is_in_person && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                  In-Person
                                </span>
                              )}
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Online</span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTreatment(treatment.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(treatment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You don't have any online treatments.</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Online Treatment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingTreatment ? "Edit Treatment" : "Add New Treatment"}</DialogTitle>
                  <DialogDescription>
                    {editingTreatment
                      ? "Update the details of your treatment"
                      : "Create a new treatment or service that you offer"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Treatment Name *</Label>
                    <Input
                      id="name"
                      value={treatmentName}
                      onChange={(e) => setTreatmentName(e.target.value)}
                      placeholder="e.g., Initial Assessment, Follow-up Session"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={treatmentDescription}
                      onChange={(e) => setTreatmentDescription(e.target.value)}
                      placeholder="Describe what this treatment or service includes"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Select value={treatmentDuration} onValueChange={setTreatmentDuration}>
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="75">75 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={treatmentPrice}
                        onChange={(e) => setTreatmentPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="in-person">Available In-Person</Label>
                      <Switch id="in-person" checked={isInPerson} onCheckedChange={setIsInPerson} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="online">Available Online</Label>
                      <Switch id="online" checked={isOnlineAvailable} onCheckedChange={setIsOnlineAvailable} />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTreatment}>
                    {editingTreatment ? "Update Treatment" : "Add Treatment"}
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
