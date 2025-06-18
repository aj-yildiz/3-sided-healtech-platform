"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUpload } from "@/components/file-upload"
import { createClientComponentClient } from "@/lib/supabase"

interface GymProfile {
  id: number
  user_id: string
  name: string
  email: string
  phone: string
  address: string
  description: string
  facilities: string[]
  opening_hours: string
  website: string
  profile_image: string | null
  latitude: number | null
  longitude: number | null
}

export default function GymProfile() {
  const { user, userProfile } = useAuth()
  const [profile, setProfile] = useState<GymProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !userProfile) return

      try {
        const { data, error } = await supabase.from("gyms").select("*").eq("id", userProfile.id).single()

        if (error) throw error

        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, userProfile, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!profile || !userProfile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("gyms")
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          description: profile.description,
          opening_hours: profile.opening_hours,
          website: profile.website,
        })
        .eq("id", userProfile.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!userProfile) return

    setUploadingImage(true)
    setError(null)

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`
      const filePath = `gym-profiles/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicURL } = supabase.storage.from("images").getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from("gyms")
        .update({ profile_image: publicURL.publicUrl })
        .eq("id", userProfile.id)

      if (updateError) throw updateError

      setProfile((prev) => (prev ? { ...prev, profile_image: publicURL.publicUrl } : null))
      setSuccess("Profile image updated successfully")
    } catch (error: any) {
      console.error("Error uploading image:", error)
      setError(error.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <RouteGuard allowedRoles={["gym"]}>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1 p-6">
            <div className="container max-w-3xl">
              <div className="text-center py-10">Loading profile...</div>
            </div>
          </main>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={["gym"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Gym Profile</h1>

            <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_image || ""} alt={profile?.name || "Gym"} />
                <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || "GM"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{profile?.name}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <FileUpload
                  onUpload={handleImageUpload}
                  accept="image/*"
                  buttonText={uploadingImage ? "Uploading..." : "Change Photo"}
                  disabled={uploadingImage}
                />
              </div>
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

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Gym Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your gym's basic details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Gym Name</Label>
                      <Input id="name" name="name" value={profile?.name || ""} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={profile?.email || ""} disabled />
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" value={profile?.phone || ""} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" value={profile?.website || ""} onChange={handleChange} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Gym Details</CardTitle>
                    <CardDescription>Update information about your gym</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={profile?.description || ""}
                        onChange={handleChange}
                        placeholder="Describe your gym and its unique features"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opening_hours">Opening Hours</Label>
                      <Textarea
                        id="opening_hours"
                        name="opening_hours"
                        rows={3}
                        value={profile?.opening_hours || ""}
                        onChange={handleChange}
                        placeholder="e.g., Monday-Friday: 6am-10pm, Saturday-Sunday: 8am-8pm"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                    <CardDescription>Update your gym's address and location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={profile?.address || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="0.000001"
                          value={profile?.latitude || ""}
                          onChange={handleChange}
                          placeholder="e.g., 51.5074"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="0.000001"
                          value={profile?.longitude || ""}
                          onChange={handleChange}
                          placeholder="e.g., -0.1278"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        You can use a service like Google Maps to find your coordinates.
                      </p>
                      <div className="h-48 bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Map preview will be shown here</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
