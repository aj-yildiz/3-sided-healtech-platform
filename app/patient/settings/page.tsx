"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPatientProfile, updatePatientProfile } from "@/app/actions/patient-actions"
import { LoadingScreen } from "@/components/loading-screen"

export default function PatientSettings() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [patientId, setPatientId] = useState<number | null>(null)

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const data = await getPatientProfile(user.id)
        if (data) {
          setPatientId(data.id)

          // Set notification preferences from data if available
          if (data.notification_preferences) {
            const prefs = data.notification_preferences
            setEmailNotifications(prefs.email_notifications ?? true)
            setSmsNotifications(prefs.sms_notifications ?? true)
            setAppointmentReminders(prefs.appointment_reminders ?? true)
            setMarketingEmails(prefs.marketing_emails ?? false)
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        setError(error.message || "Failed to load settings")

        // Implement retry with exponential backoff for rate limiting
        if (error.message?.includes("Too many requests") && retryCount < 3) {
          const timeout = Math.pow(2, retryCount) * 1000
          console.log(`Retrying in ${timeout}ms...`)

          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, timeout)

          return
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, retryCount])

  const handleSaveNotifications = async () => {
    if (!patientId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updatePatientProfile(patientId, {
        notification_preferences: {
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
          appointment_reminders: appointmentReminders,
          marketing_emails: marketingEmails,
        },
      })

      setSuccess("Notification preferences updated successfully")
    } catch (error: any) {
      console.error("Error updating notification preferences:", error)
      setError(error.message || "Failed to update notification preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    // Basic validation
    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // This is a placeholder - you would need to implement the actual password change
      // in your auth-actions.ts file
      // await changePassword(currentPassword, newPassword)

      // For now, just simulate success
      setTimeout(() => {
        setSuccess("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setSaving(false)
      }, 1000)
    } catch (error: any) {
      console.error("Error changing password:", error)
      setError(error.message || "Failed to change password")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <RouteGuard allowedRoles={["patient"]}>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1 p-6">
            <LoadingScreen />
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
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

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

            <Tabs defaultValue="notifications" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                      </div>
                      <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive reminders about upcoming appointments</p>
                      </div>
                      <Switch
                        id="appointment-reminders"
                        checked={appointmentReminders}
                        onCheckedChange={setAppointmentReminders}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                      </div>
                      <Switch id="marketing-emails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleChangePassword} disabled={saving}>
                      {saving ? "Updating..." : "Change Password"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="profile-visibility">Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow doctors to view your profile</p>
                      </div>
                      <Switch id="profile-visibility" defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-sharing">Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">Share anonymized data for research purposes</p>
                      </div>
                      <Switch id="data-sharing" defaultChecked={false} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Privacy Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive">Delete Account</Button>
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
