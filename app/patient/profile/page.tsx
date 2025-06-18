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
import { getPatientProfile, updatePatientProfile, uploadPatientProfileImage } from "@/app/actions/patient-actions"

interface PatientProfile {
  id: number
  user_id: string
  name: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  gender: string
  blood_type: string
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string
  medical_conditions: string
  medications: string
  profile_image: string | null
}

export default function PatientProfile() {
  const { user, userProfile } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !userProfile) return

      try {
        const data = await getPatientProfile(user.id)
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, userProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!profile || !userProfile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updatePatientProfile(userProfile.id, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        allergies: profile.allergies,
        medical_conditions: profile.medical_conditions,
        medications: profile.medications,
      })

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
      const result = await uploadPatientProfileImage(userProfile.id, file)
      setProfile((prev) => (prev ? { ...prev, profile_image: result.imageUrl } : null))
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
      <RouteGuard allowedRoles={["patient"]}>
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
    <RouteGuard allowedRoles={["patient"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_image || ""} alt={profile?.name || "Profile"} />
                <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || "PT"}</AvatarFallback>
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

            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="medical">Medical Information</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
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
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={profile?.address || ""}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          name="date_of_birth"
                          type="date"
                          value={profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : ""}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Input id="gender" name="gender" value={profile?.gender || ""} disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Input id="blood_type" name="blood_type" value={profile?.blood_type || ""} disabled />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="medical">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                    <CardDescription>Update your medical details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        name="allergies"
                        rows={3}
                        value={profile?.allergies || ""}
                        onChange={handleChange}
                        placeholder="List any allergies you have"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medical_conditions">Medical Conditions</Label>
                      <Textarea
                        id="medical_conditions"
                        name="medical_conditions"
                        rows={3}
                        value={profile?.medical_conditions || ""}
                        onChange={handleChange}
                        placeholder="List any medical conditions you have"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea
                        id="medications"
                        name="medications"
                        rows={3}
                        value={profile?.medications || ""}
                        onChange={handleChange}
                        placeholder="List any medications you are currently taking"
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

              <TabsContent value="emergency">
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Update your emergency contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        name="emergency_contact_name"
                        value={profile?.emergency_contact_name || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        name="emergency_contact_phone"
                        value={profile?.emergency_contact_phone || ""}
                        onChange={handleChange}
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
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
