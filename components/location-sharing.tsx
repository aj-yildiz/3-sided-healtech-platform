"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"

interface LocationSharingProps {
  onLocationReceived: (latitude: number, longitude: number) => void
}

export function LocationSharing({ onLocationReceived }: LocationSharingProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    setOpen(true)
    setError(null)
  }

  const handleShareLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onLocationReceived(latitude, longitude)
        setLoading(false)
        setOpen(false)
      },
      (err) => {
        console.error("Error getting location:", err)
        setError("Failed to get your location. Please try again or enter your location manually.")
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    )
  }

  return (
    <>
      <Button variant="outline" onClick={requestLocation} className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>Share My Location</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Location</DialogTitle>
            <DialogDescription>
              We need your location to find healthcare providers near you. Your location will only be used for this
              purpose.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareLocation} disabled={loading}>
              {loading ? "Getting location..." : "Share Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
