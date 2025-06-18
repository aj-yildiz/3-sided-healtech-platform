import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { CheckCircle, Users, Building, User } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-purple-800">About Vastis</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We're on a mission to transform how patients connect with healthcare providers by utilizing available gym
            spaces.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-purple-800">Our Story</h2>
              <p className="text-lg text-gray-700">
                Vastis was founded with a simple idea: make healthcare more accessible by connecting patients with
                providers in convenient locations. We noticed that many gyms and fitness facilities had underutilized
                spaces that could be perfect for healthcare practitioners.
              </p>
              <p className="text-lg text-gray-700">
                By bringing these parties together, we create a win-win-win situation: patients get convenient care,
                providers expand their practice, and gyms generate additional revenue from their spaces.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-lg">
                  Creating a world where quality healthcare is accessible to everyone, everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-purple-800">Our Mission</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              To create a seamless ecosystem where patients, healthcare providers, and gyms can connect and thrive
              together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-700">For Patients</h3>
              <p className="text-gray-700 mb-4">
                We aim to make healthcare more accessible by providing convenient locations and easy booking options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Find providers near you</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Book appointments easily</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Access quality care</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-700">For Providers</h3>
              <p className="text-gray-700 mb-4">
                We help healthcare practitioners expand their practice and reach more patients without the overhead of
                maintaining their own facilities.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Expand your patient base</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Practice in multiple locations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Reduce overhead costs</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-700">For Gyms</h3>
              <p className="text-gray-700 mb-4">
                We enable gyms and fitness facilities to maximize their space utilization and generate additional
                revenue streams.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Monetize unused space</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Attract new members</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Create a health hub</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-purple-800">Our Values</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              These core principles guide everything we do at Vastis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Accessibility</h3>
              <p className="text-gray-700">
                We believe healthcare should be accessible to everyone, regardless of location or schedule constraints.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Quality</h3>
              <p className="text-gray-700">
                We maintain high standards for all healthcare providers on our platform to ensure patients receive
                excellent care.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Innovation</h3>
              <p className="text-gray-700">
                We continuously seek new ways to improve the healthcare experience for all stakeholders in our
                ecosystem.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Collaboration</h3>
              <p className="text-gray-700">
                We believe in the power of bringing different parties together to create solutions that benefit
                everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-purple-800">Our Team</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Meet the passionate people behind Vastis who are working to transform healthcare accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-square relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="h-20 w-20 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <p className="font-medium">Team Member {i}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-purple-700">Team Member {i}</h3>
                  <p className="text-sm text-gray-600">Position Title</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pink-400 blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-purple-800">Join the Vastis Community</h2>
            <p className="text-xl mb-8 text-gray-700">
              Whether you're a patient seeking care, a provider looking to expand, or a gym with space to share, we'd
              love to have you join us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/register">Sign Up Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
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
            <p>&copy; {new Date().getFullYear()} Vastis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
