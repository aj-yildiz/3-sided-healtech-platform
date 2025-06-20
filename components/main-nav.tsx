"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VastisLogo } from "@/components/vastis-logo"

export function MainNav() {
  const { user, userRole, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/patients", label: "Patients" },
    { href: "/admin/doctors", label: "Healthcare Providers" },
    { href: "/admin/gyms", label: "Gyms" },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/reports", label: "Reports" },
  ]

  const doctorLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/doctor/availability", label: "Manage Availability" },
    { href: "/doctor/locations", label: "My Locations" },
    { href: "/doctor/services", label: "My Services" },
    { href: "/doctor/appointments", label: "Appointments" },
    { href: "/doctor/patients", label: "My Patients" },
  ]

  const gymLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/gym/availability", label: "Manage Availability" },
    { href: "/gym/doctors", label: "Healthcare Providers" },
    { href: "/gym/appointments", label: "Appointments" },
    { href: "/gym/analytics", label: "Analytics" },
  ]

  const patientLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/patient/find-provider", label: "Find Healthcare Provider" },
    { href: "/patient/appointments", label: "My Appointments" },
    { href: "/patient/medical-history", label: "Medical History" },
  ]

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ]

  const links = user
    ? userRole === "admin"
      ? adminLinks
      : userRole === "doctor"
        ? doctorLinks
        : userRole === "gym"
          ? gymLinks
          : userRole === "patient"
            ? patientLinks
            : publicLinks
    : publicLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <VastisLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link href="/about" className="text-primary font-medium">About</Link>
              <Link href="/login">
                <Button className="bg-primary text-primary-foreground">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-primary text-primary">Sign Up</Button>
              </Link>
            </>
          )}
          {user && (
            <>
              <Link href={`/${userRole}/profile`} className="text-primary font-medium">Profile</Link>
              <Button onClick={async () => { await signOut(); if (window?.toast) window.toast.success('Logged out successfully!'); }} className="bg-primary text-primary-foreground">Logout</Button>
            </>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-4">Sign up</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
