"use client"

import type React from "react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DoctorProfile {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  license_number: string
  bio: string
  education: string
  experience_years: number
}

export default function DoctorProfile() {
  const { user, userProfile } = useAuth()
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !userProfile) return

      try {
        const { data, error } = await supabase.from("doctors").select("*").eq("id", userProfile.id).single()

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

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!profile || !userProfile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("doctors")
        .update({
          name: profile.name,
          phone: profile.phone,
          specialization: profile.specialization,
          license_number: profile.license_number,
          bio: profile.bio,
          education: profile.education,
          experience_years: profile.experience_years,
        })
        .eq("id", userProfile.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <RouteGuard allowedRoles={["doctor"]}>
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
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>

            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="professional">Professional Details</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

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
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profile?.bio || ""}
                        onChange={handleChange}
                        placeholder="Tell patients about yourself"
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

              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Update your professional information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Select
                        value={profile?.specialization || ""}
                        onValueChange={(value) => handleSelectChange("specialization", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                          <SelectItem value="Optometry">Optometry</SelectItem>
                          <SelectItem value="Counselling">Counselling</SelectItem>
                          <SelectItem value="Chiropractic">Chiropractic</SelectItem>
                          <SelectItem value="Massage Therapy">Massage Therapy</SelectItem>
                          <SelectItem value="Acupuncture">Acupuncture</SelectItem>
                          <SelectItem value="Dietetics">Dietetics</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={profile?.license_number || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Textarea
                        id="education"
                        name="education"
                        rows={3}
                        value={profile?.education || ""}
                        onChange={handleChange}
                        placeholder="Your educational background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        min="0"
                        value={profile?.experience_years || 0}
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
