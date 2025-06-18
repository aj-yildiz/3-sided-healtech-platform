import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { VastisLogo } from "@/components/vastis-logo"
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  User,
  Users,
  Wallet,
  Heart,
  Stethoscope,
  Clipboard,
  BarChart,
  Search,
  MessageSquare,
} from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNav />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-400 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
        </div>
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-purple-800">Our Services</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Vastis provides tailored solutions for patients, healthcare practitioners, and fitness spaces.
          </p>
        </div>
      </section>

      {/* Patients Section */}
      <section id="patients" className="py-20 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                <User className="h-5 w-5" />
                <span className="font-medium">For Patients</span>
              </div>
              <h2 className="text-3xl font-bold text-purple-800">Find and Book Quality Healthcare</h2>
              <p className="text-lg text-gray-700">
                Vastis makes it easy to find qualified physiotherapists, book appointments at convenient locations, and
                manage your healthcare journey all in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Find Specialists</h3>
                    <p className="text-sm text-gray-600">
                      Search for physiotherapists by specialty, location, and reviews
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Easy Booking</h3>
                    <p className="text-sm text-gray-600">Book appointments with just a few clicks</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Medical Records</h3>
                    <p className="text-sm text-gray-600">Access your medical history and treatment plans</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Secure Communication</h3>
                    <p className="text-sm text-gray-600">Message your healthcare providers securely</p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/register?role=patient">Sign Up as a Patient</Link>
              </Button>
            </div>

            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <div className="bg-purple-600 p-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">Patient Dashboard</h3>
                      <p className="text-gray-600">Manage your healthcare journey in one place</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Book Appointments</h3>
                        <p className="text-xs text-gray-600 mt-1">Schedule sessions with top physiotherapists</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <MapPin className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Find Locations</h3>
                        <p className="text-xs text-gray-600 mt-1">Discover convenient treatment spaces near you</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <FileText className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Track Progress</h3>
                        <p className="text-xs text-gray-600 mt-1">Monitor your treatment and recovery journey</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Communicate</h3>
                        <p className="text-xs text-gray-600 mt-1">Stay in touch with your healthcare team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Practitioners Section */}
      <section id="practitioners" className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                <Stethoscope className="h-5 w-5" />
                <span className="font-medium">For Healthcare Practitioners</span>
              </div>
              <h2 className="text-3xl font-bold text-purple-800">Grow Your Practice Without Overhead</h2>
              <p className="text-lg text-gray-700">
                Vastis helps physiotherapists and healthcare providers expand their practice by connecting them with
                patients and providing access to quality spaces without the overhead costs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Expand Your Patient Base</h3>
                    <p className="text-sm text-gray-600">Connect with new patients looking for your services</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Multiple Locations</h3>
                    <p className="text-sm text-gray-600">Practice at different gyms and facilities</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Flexible Scheduling</h3>
                    <p className="text-sm text-gray-600">Set your own hours and manage your availability</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Clipboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Patient Management</h3>
                    <p className="text-sm text-gray-600">Manage patient records, notes, and treatment plans</p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/register?role=doctor">Join as a Healthcare Provider</Link>
              </Button>
            </div>

            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <div className="bg-purple-600 p-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">Provider Dashboard</h3>
                      <p className="text-gray-600">Manage your practice efficiently</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Manage Schedule</h3>
                        <p className="text-xs text-gray-600 mt-1">Set your availability and working hours</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Patient Directory</h3>
                        <p className="text-xs text-gray-600 mt-1">Access and manage your patient information</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <BarChart className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Practice Analytics</h3>
                        <p className="text-xs text-gray-600 mt-1">Track your performance and growth</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Wallet className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Earnings Dashboard</h3>
                        <p className="text-xs text-gray-600 mt-1">Monitor your income and payments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitness & Wellness Spaces Section */}
      <section id="spaces" className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                <Building className="h-5 w-5" />
                <span className="font-medium">For Fitness & Wellness Spaces</span>
              </div>
              <h2 className="text-3xl font-bold text-purple-800">Maximize Your Space Utilization</h2>
              <p className="text-lg text-gray-700">
                Gyms and fitness facilities can generate additional revenue by offering their unused spaces to
                healthcare practitioners, creating a comprehensive wellness hub for their members.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Additional Revenue</h3>
                    <p className="text-sm text-gray-600">Generate income from underutilized spaces</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Attract New Members</h3>
                    <p className="text-sm text-gray-600">Offer comprehensive wellness services</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Enhanced Member Experience</h3>
                    <p className="text-sm text-gray-600">Provide healthcare services on-site</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-purple-600">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-700">Space Utilization Analytics</h3>
                    <p className="text-sm text-gray-600">Track and optimize your space usage</p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/register?role=gym">Partner as a Facility</Link>
              </Button>
            </div>

            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <div className="bg-purple-600 p-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">Facility Dashboard</h3>
                      <p className="text-gray-600">Optimize your space utilization</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <MapPin className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Space Management</h3>
                        <p className="text-xs text-gray-600 mt-1">List and manage your available spaces</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Provider Network</h3>
                        <p className="text-xs text-gray-600 mt-1">Connect with healthcare professionals</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Booking Calendar</h3>
                        <p className="text-xs text-gray-600 mt-1">View and manage space bookings</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                        <Wallet className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-purple-700">Revenue Tracking</h3>
                        <p className="text-xs text-gray-600 mt-1">Monitor your additional income</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-purple-800">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We offer flexible pricing options for all users of our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* For Patients */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 bg-purple-50">
                <h3 className="text-xl font-semibold mb-2 text-purple-800">For Patients</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-purple-700">Free</span>
                  <span className="text-gray-600 ml-2">to join</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Find and book appointments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Manage medical records</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Secure provider communication</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Pay only for services received</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/register?role=patient">Sign Up</Link>
                </Button>
              </div>
            </div>

            {/* For Healthcare Providers */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 bg-purple-50">
                <h3 className="text-xl font-semibold mb-2 text-purple-800">For Providers</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-purple-700">10%</span>
                  <span className="text-gray-600 ml-2">per booking</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Access to patient network</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Booking and scheduling tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Patient record management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Access to partner facilities</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/register?role=doctor">Join Now</Link>
                </Button>
              </div>
            </div>

            {/* For Gyms & Facilities */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 bg-purple-50">
                <h3 className="text-xl font-semibold mb-2 text-purple-800">For Facilities</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-purple-700">5%</span>
                  <span className="text-gray-600 ml-2">of space bookings</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">List available spaces</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Connect with healthcare providers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Space utilization analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Automated payments</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/register?role=gym">Partner Now</Link>
                </Button>
              </div>
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
            <h2 className="text-3xl font-bold mb-6 text-purple-800">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-gray-700">
              Join Vastis today and transform how you connect with healthcare services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/register">Create an Account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-50 border-t border-purple-100 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <VastisLogo size="md" variant="vibrant" className="mb-4" />
              <p className="text-gray-600">Connecting patients with physiotherapists in available gym spaces.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
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
              <h3 className="text-lg font-semibold mb-4">For Users</h3>
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
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
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
            <p>&copy; {new Date().getFullYear()} Vastis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
