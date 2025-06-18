"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VastisLogo } from "@/components/vastis-logo"
import { MainNav } from "@/components/main-nav"
import { ArrowRight, Calendar, MapPin, Shield, Users } from "lucide-react"
import { useEffect, useState } from "react"

function CopyrightFooter() {
  const [year, setYear] = useState<number | null>(null)
  useEffect(() => setYear(new Date().getFullYear()), [])
  if (year === null) return null
  return <p>&copy; {year} Vastis. All rights reserved.</p>
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-purple-50 to-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-400 blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
          </div>
          <div className="container relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <VastisLogo size="xl" variant="vibrant" className="mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500">
                  Connecting Patients with Physiotherapists in Available Gym Spaces
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Vastis makes it easy to find and book physiotherapy sessions at convenient locations near you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                      Our Services
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-8 flex items-center justify-center">
                  <VastisLogo asImage size="2xl" variant="white" showText={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-purple-800">How Vastis Works</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Our platform connects patients, physiotherapists, and gyms in a seamless ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-700">Find Specialists</h3>
                <p className="text-gray-600">
                  Search for qualified physiotherapists based on specialty, location, and availability
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-700">Convenient Locations</h3>
                <p className="text-gray-600">
                  Book sessions at partner gyms and fitness centers close to your home or work
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-700">Easy Scheduling</h3>
                <p className="text-gray-600">
                  Book and manage appointments with a few clicks, receive reminders and updates
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-700">Secure Records</h3>
                <p className="text-gray-600">
                  Keep your medical history and treatment plans in one secure, accessible place
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pink-400 blur-3xl"></div>
          </div>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-purple-800">
                Ready to transform your physiotherapy experience?
              </h2>
              <p className="text-xl mb-8 text-gray-700">
                Join thousands of patients and healthcare providers already using Vastis
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register?role=patient">
                  <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                    Sign Up as Patient
                  </Button>
                </Link>
                <Link href="/register?role=doctor">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Join as Physiotherapist
                  </Button>
                </Link>
                <Link href="/register?role=gym">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Partner as Gym
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-purple-50 border-t border-purple-100">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <VastisLogo size="md" variant="vibrant" className="mb-4" />
              <p className="text-gray-600 mb-4">Connecting patients with physiotherapists in available gym spaces.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Patients</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services#patients" className="text-gray-600 hover:text-purple-600">
                    Find a Physiotherapist
                  </Link>
                </li>
                <li>
                  <Link href="/patient/appointments" className="text-gray-600 hover:text-purple-600">
                    Book Appointments
                  </Link>
                </li>
                <li>
                  <Link href="/patient/medical-history" className="text-gray-600 hover:text-purple-600">
                    Medical Records
                  </Link>
                </li>
                <li>
                  <Link href="/patient/insurance" className="text-gray-600 hover:text-purple-600">
                    Insurance
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Providers</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services#practitioners" className="text-gray-600 hover:text-purple-600">
                    Join as Physiotherapist
                  </Link>
                </li>
                <li>
                  <Link href="/services#spaces" className="text-gray-600 hover:text-purple-600">
                    Partner as Gym
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-purple-600">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-purple-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-purple-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-100 mt-12 pt-8 text-center text-gray-500">
            <CopyrightFooter />
          </div>
        </div>
      </footer>
    </div>
  )
}
