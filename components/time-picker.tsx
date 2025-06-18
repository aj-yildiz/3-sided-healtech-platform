"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, setHours] = useState<string>("12")
  const [minutes, setMinutes] = useState<string>("00")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  // Parse the value (HH:MM format) into hours, minutes, and period
  useEffect(() => {
    if (value) {
      const [hoursStr, minutesStr] = value.split(":")
      const hoursNum = Number.parseInt(hoursStr, 10)

      if (hoursNum >= 12) {
        setHours(hoursNum === 12 ? "12" : (hoursNum - 12).toString().padStart(2, "0"))
        setPeriod("PM")
      } else {
        setHours(hoursNum === 0 ? "12" : hoursNum.toString().padStart(2, "0"))
        setPeriod("AM")
      }

      setMinutes(minutesStr)
    }
  }, [value])

  // Update the value when hours, minutes, or period changes
  const updateValue = () => {
    let hoursNum = Number.parseInt(hours, 10)

    // Convert to 24-hour format
    if (period === "PM" && hoursNum < 12) {
      hoursNum += 12
    } else if (period === "AM" && hoursNum === 12) {
      hoursNum = 0
    }

    const newValue = `${hoursNum.toString().padStart(2, "0")}:${minutes}`
    onChange(newValue)
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = Number.parseInt(value, 10)

    if (value === "" || (numValue >= 1 && numValue <= 12)) {
      setHours(value)
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = Number.parseInt(value, 10)

    if (value === "" || (numValue >= 0 && numValue <= 59)) {
      setMinutes(value.padStart(2, "0"))
    }
  }

  const handleHoursBlur = () => {
    if (hours === "") {
      setHours("12")
    } else {
      const numValue = Number.parseInt(hours, 10)
      setHours(numValue.toString().padStart(2, "0"))
    }
    updateValue()
  }

  const handleMinutesBlur = () => {
    if (minutes === "") {
      setMinutes("00")
    } else {
      const numValue = Number.parseInt(minutes, 10)
      setMinutes(numValue.toString().padStart(2, "0"))
    }
    updateValue()
  }

  const togglePeriod = () => {
    setPeriod((prev) => {
      const newPeriod = prev === "AM" ? "PM" : "AM"
      setTimeout(updateValue, 0)
      return newPeriod
    })
  }

  const formatDisplayTime = () => {
    return `${hours}:${minutes} ${period}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatDisplayTime() : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex items-center space-x-2">
          <div className="grid gap-1">
            <Label htmlFor="hours">Hours</Label>
            <Input id="hours" className="w-16" value={hours} onChange={handleHoursChange} onBlur={handleHoursBlur} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="minutes">Minutes</Label>
            <Input
              id="minutes"
              className="w-16"
              value={minutes}
              onChange={handleMinutesChange}
              onBlur={handleMinutesBlur}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="period">Period</Label>
            <Button id="period" variant="outline" className="w-16" onClick={togglePeriod} type="button">
              {period}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
