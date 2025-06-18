"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Mail, Phone, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

function CopyrightFooter() {
  const [year, setYear] = useState<number | null>(null)
  useEffect(() => setYear(new Date().getFullYear()), [])
  if (year === null) return null
  return <p>&copy; {year} Vastis. All rights reserved.</p>
}

export default function ContactPage() {
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName || !lastName || !email || !subject || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)

      // Reset form
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setSubject("")
      setMessage("")

      toast({
        title: "Message sent",
        description: "Thank you for your message. We'll get back to you soon!",
      })
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNav />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
          <div className="container max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-purple-800">Contact Us</h1>
              <p className="text-xl text-gray-700">Have questions about Vastis? We're here to help.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                    <CardDescription>
                      Fill out the form below and our team will get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      {success && (
                        <Alert className="bg-green-50 border-green-200">
                          <AlertDescription className="text-green-700">
                            Your message has been sent successfully! We'll get back to you soon.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First name *</Label>
                          <Input
                            id="first-name"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last name *</Label>
                          <Input
                            id="last-name"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Select value={subject} onValueChange={setSubject} required>
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Please describe how we can help you"
                          className="min-h-[150px]"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                        {loading ? "Sending..." : "Send Message"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-sm text-gray-600">
                          123 Vastis Way
                          <br />
                          Vancouver, BC V6B 1A9
                          <br />
                          Canada
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-sm text-gray-600">
                          support@vastis.com
                          <br />
                          info@vastis.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-sm text-gray-600">
                          +1 (604) 555-1234
                          <br />
                          Monday - Friday, 9am - 5pm PST
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Hours</h3>
                        <p className="text-sm text-gray-600">
                          Monday - Friday: 9am - 5pm
                          <br />
                          Saturday: 10am - 2pm
                          <br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Help Center</h3>
                      <p className="text-sm text-gray-600 mb-2">Find answers to frequently asked questions</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Visit Help Center
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-gray-600 mb-2">Chat with our support team in real-time</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Start Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-purple-50 border-t border-purple-100 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Vastis</h3>
              <p className="text-gray-600">Connecting patients with healthcare providers in convenient locations.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-purple-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-purple-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-600 hover:text-purple-600">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-purple-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">For Users</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/register?role=patient" className="text-gray-600 hover:text-purple-600">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link href="/register?role=doctor" className="text-gray-600 hover:text-purple-600">
                    Healthcare Providers
                  </Link>
                </li>
                <li>
                  <Link href="/register?role=gym" className="text-gray-600 hover:text-purple-600">
                    Gyms & Facilities
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-100 mt-8 pt-8 text-center text-sm text-gray-500">
            <CopyrightFooter />
          </div>
        </div>
      </footer>
    </div>
  )
}
