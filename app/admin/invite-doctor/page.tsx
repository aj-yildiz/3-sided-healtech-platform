"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { v4 as uuidv4 } from "uuid"

export default function InviteDoctor() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const supabase = createClientComponentClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Generate a unique token
      const token = uuidv4()

      // Check if email already invited
      const { data: existingInvite } = await supabase.from("doctor_invites").select("*").eq("email", email).single()

      if (existingInvite) {
        // Update existing invite
        const { error } = await supabase
          .from("doctor_invites")
          .update({
            token,
            status: "pending",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          })
          .eq("email", email)

        if (error) throw error
      } else {
        // Create new invite
        const { error } = await supabase.from("doctor_invites").insert({
          email,
          token,
          status: "pending",
        })

        if (error) throw error
      }

      // In a real application, you would send an email with the invitation link
      // For this demo, we'll just show a success message

      setSuccess(true)
      setEmail("")
    } catch (error: any) {
      console.error("Error sending invitation:", error)
      setError(error.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container max-w-md">
          <h1 className="text-3xl font-bold mb-6">Invite Physiotherapist</h1>

          <Card>
            <CardHeader>
              <CardTitle>Send Invitation</CardTitle>
              <CardDescription>Invite a physiotherapist to join the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4">
                  <AlertDescription>
                    Invitation sent successfully! The physiotherapist will receive an email with instructions to join.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="physiotherapist@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
