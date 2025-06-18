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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash2, Plus, Image } from "lucide-react"

interface Space {
  id: number
  name: string
  description: string
  capacity: number
  size_sqft: number
  price_per_hour: number
  equipment: string
  image_url: string | null
  gym_id: number
}

export default function GymSpaces() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [gymId, setGymId] = useState<number | null>(null)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [spaceName, setSpaceName] = useState("")
  const [spaceDescription, setSpaceDescription] = useState("")
  const [spaceCapacity, setSpaceCapacity] = useState("")
  const [spaceSizeSqft, setSpaceSizeSqft] = useState("")
  const [spacePricePerHour, setSpacePricePerHour] = useState("")
  const [spaceEquipment, setSpaceEquipment] = useState("")
  const [spaceImage, setSpaceImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchGymData = async () => {
      if (!user) return

      try {
        // Get gym ID
        const { data: gymData, error: gymError } = await supabase
          .from("gyms")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (gymError) throw gymError

        setGymId(gymData.id)

        // Get spaces
        const { data: spacesData, error: spacesError } = await supabase
          .from("gym_spaces")
          .select("*")
          .eq("gym_id", gymData.id)

        if (spacesError) throw spacesError

        setSpaces(spacesData || [])
      } catch (error) {
        console.error("Error fetching gym data:", error)
        setError("Failed to load your spaces")
      } finally {
        setLoading(false)
      }
    }

    fetchGymData()
  }, [user, supabase])

  const resetForm = () => {
    setSpaceName("")
    setSpaceDescription("")
    setSpaceCapacity("")
    setSpaceSizeSqft("")
    setSpacePricePerHour("")
    setSpaceEquipment("")
    setSpaceImage(null)
    setEditingSpace(null)
  }

  const openEditDialog = (space: Space) => {
    setEditingSpace(space)
    setSpaceName(space.name)
    setSpaceDescription(space.description || "")
    setSpaceCapacity(space.capacity?.toString() || "")
    setSpaceSizeSqft(space.size_sqft?.toString() || "")
    setSpacePricePerHour(space.price_per_hour?.toString() || "")
    setSpaceEquipment(space.equipment || "")
    setIsDialogOpen(true)
  }

  const handleSaveSpace = async () => {
    if (!spaceName || !spaceDescription || !spaceCapacity || !spacePricePerHour) {
      setError("Please fill in all required fields")
      return
    }

    if (!gymId) return

    setSaving(true)
    setError(null)

    try {
      let imageUrl = editingSpace?.image_url || null

      // Upload image if provided
      if (spaceImage) {
        const fileExt = spaceImage.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `gym-spaces/${gymId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("gym-images").upload(filePath, spaceImage)

        if (uploadError) throw uploadError

        imageUrl = filePath
      }

      const spaceData = {
        name: spaceName,
        description: spaceDescription,
        capacity: Number.parseInt(spaceCapacity),
        size_sqft: spaceSizeSqft ? Number.parseInt(spaceSizeSqft) : null,
        price_per_hour: Number.parseFloat(spacePricePerHour),
        equipment: spaceEquipment,
        image_url: imageUrl,
        gym_id: gymId,
      }

      let result

      if (editingSpace) {
        // Update existing space
        const { data, error } = await supabase
          .from("gym_spaces")
          .update(spaceData)
          .eq("id", editingSpace.id)
          .select()
          .single()

        if (error) throw error
        result = data

        // Update local state
        setSpaces(spaces.map((s) => (s.id === editingSpace.id ? result : s)))

        toast({
          title: "Space updated",
          description: "Your space has been updated successfully.",
        })
      } else {
        // Create new space
        const { data, error } = await supabase.from("gym_spaces").insert(spaceData).select().single()

        if (error) throw error
        result = data

        // Update local state
        setSpaces([...spaces, result])

        toast({
          title: "Space created",
          description: "Your new space has been created successfully.",
        })
      }

      // Close dialog and reset form
      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving space:", error)
      setError(error.message || "Failed to save space")

      toast({
        title: "Error",
        description: "There was a problem saving your space. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSpace = async (id: number) => {
    if (!confirm("Are you sure you want to delete this space?")) return

    try {
      const { error } = await supabase.from("gym_spaces").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setSpaces(spaces.filter((s) => s.id !== id))

      toast({
        title: "Space deleted",
        description: "The space has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting space:", error)

      toast({
        title: "Error",
        description: "There was a problem deleting the space. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <RouteGuard allowedRoles={["gym"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Manage Spaces</h1>
              <Button
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Space
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Spaces</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="booked">Booked</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="text-center py-10">Loading spaces...</div>
                ) : spaces.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {spaces.map((space) => (
                      <Card key={space.id}>
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {space.image_url ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gym-images/${space.image_url}`}
                              alt={space.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Image className="h-12 w-12 text-muted-foreground opacity-50" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle>{space.name}</CardTitle>
                          <CardDescription>
                            Capacity: {space.capacity} people • {space.size_sqft} sq ft
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {space.description || "No description provided."}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-lg">${space.price_per_hour}/hour</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSpace(space.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(space)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">You haven't created any spaces yet.</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Space
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="available">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Available spaces will be shown here based on your availability settings.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="booked">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Currently booked spaces will be shown here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingSpace ? "Edit Space" : "Add New Space"}</DialogTitle>
                  <DialogDescription>
                    {editingSpace
                      ? "Update the details of your space"
                      : "Create a new space that healthcare providers can book"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Space Name *</Label>
                    <Input
                      id="name"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      placeholder="e.g., Therapy Room 1, Yoga Studio"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={spaceDescription}
                      onChange={(e) => setSpaceDescription(e.target.value)}
                      placeholder="Describe the space, features, and amenities"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (people) *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={spaceCapacity}
                        onChange={(e) => setSpaceCapacity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size (sq ft)</Label>
                      <Input
                        id="size"
                        type="number"
                        min="0"
                        value={spaceSizeSqft}
                        onChange={(e) => setSpaceSizeSqft(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Hour ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={spacePricePerHour}
                      onChange={(e) => setSpacePricePerHour(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment</Label>
                    <Textarea
                      id="equipment"
                      value={spaceEquipment}
                      onChange={(e) => setSpaceEquipment(e.target.value)}
                      placeholder="List equipment available in this space"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Space Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSpaceImage(e.target.files[0])
                        }
                      }}
                    />
                    {editingSpace?.image_url && !spaceImage && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Current image:</p>
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gym-images/${editingSpace.image_url}`}
                          alt="Current space image"
                          className="mt-1 h-20 rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSpace} disabled={saving}>
                    {saving ? "Saving..." : editingSpace ? "Update Space" : "Add Space"}
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
