"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvitePractitioner() {
  const { user } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [inviteType, setInviteType] = useState<"email" | "link">("email")
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const sendInvite = async () => {
    if (!firstName || !lastName || !email || !specialization) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setInviteLink(null)

    try {
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Create the invitation in the database
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          specialization,
          message,
          inviteCode,
          inviteType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create invitation")
      }

      const data = await response.json()

      if (inviteType === "email") {
        setSuccess(`Invitation email sent to ${email}`)
      } else {
        // Generate invite link
        const baseUrl = window.location.origin
        const link = `${baseUrl}/register?invite=${inviteCode}&email=${encodeURIComponent(email)}&role=doctor`
        setInviteLink(link)
        setSuccess("Invitation link generated successfully")
      }

      // Reset form
      if (inviteType === "email") {
        setFirstName("")
        setLastName("")
        setEmail("")
        setPhone("")
        setSpecialization("")
        setMessage("")
      }
    } catch (error: any) {
      console.error("Error sending invitation:", error)
      setError(error.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Invite Healthcare Practitioner</h1>

            <Tabs defaultValue="invite" className="space-y-4">
              <TabsList>
                <TabsTrigger value="invite">Send Invitation</TabsTrigger>
                <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
              </TabsList>

              <TabsContent value="invite">
                <Card>
                  <CardHeader>
                    <CardTitle>Invite a New Healthcare Practitioner</CardTitle>
                    <CardDescription>
                      Send an invitation to a healthcare practitioner to join the platform
                    </CardDescription>
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

                    {inviteLink && (
                      <Alert>
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>Share this link with the practitioner:</p>
                            <div className="p-2 bg-muted rounded-md overflow-x-auto">
                              <code className="text-xs">{inviteLink}</code>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(inviteLink)
                                setSuccess("Link copied to clipboard!")
                              }}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label>Invitation Method</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="email-invite"
                            checked={inviteType === "email"}
                            onChange={() => setInviteType("email")}
                          />
                          <Label htmlFor="email-invite">Send Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="link-invite"
                            checked={inviteType === "link"}
                            onChange={() => setInviteType("link")}
                          />
                          <Label htmlFor="link-invite">Generate Link</Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger id="specialization">
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
                          <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                          <SelectItem value="Athletic Therapy">Athletic Therapy</SelectItem>
                          <SelectItem value="Podiatry">Podiatry</SelectItem>
                          <SelectItem value="Naturopathic Medicine">Naturopathic Medicine</SelectItem>
                          <SelectItem value="Midwifery">Midwifery</SelectItem>
                          <SelectItem value="Osteopathy">Osteopathy</SelectItem>
                          <SelectItem value="Personal Training">Personal Training</SelectItem>
                          <SelectItem value="Kinesiology">Kinesiology</SelectItem>
                          <SelectItem value="Aesthetics">Aesthetics</SelectItem>
                          <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message to the invitation email"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={sendInvite} disabled={loading}>
                      {loading ? "Sending..." : inviteType === "email" ? "Send Invitation" : "Generate Link"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>View and manage pending practitioner invitations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Pending invitations will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
