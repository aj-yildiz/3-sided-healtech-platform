"use client"

import { useState } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const addResult = (test: string, result: any, error?: any) => {
    setResults(prev => [...prev, { test, result, error, timestamp: new Date().toISOString() }])
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Test 1: Check auth user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      addResult("Get Current User", user, userError)

      if (user) {
        // Test 2: Check if user_roles table exists
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .limit(1)
          addResult("user_roles table check", roleData, roleError)
        } catch (err) {
          addResult("user_roles table check", null, err)
        }

        // Test 3: Check user's specific role
        try {
          const { data: userRole, error: userRoleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle()
          addResult("User's role", userRole, userRoleError)
        } catch (err) {
          addResult("User's role", null, err)
        }

        // Test 4: Check patients table
        try {
          const { data: patientsData, error: patientsError } = await supabase
            .from("patients")
            .select("*")
            .limit(1)
          addResult("patients table check", patientsData, patientsError)
        } catch (err) {
          addResult("patients table check", null, err)
        }

        // Test 5: Check service_types table
        try {
          const { data: serviceTypes, error: serviceError } = await supabase
            .from("service_types")
            .select("*")
            .limit(3)
          addResult("service_types table check", serviceTypes, serviceError)
        } catch (err) {
          addResult("service_types table check", null, err)
        }
      }
    } catch (error) {
      addResult("General Error", null, error)
    } finally {
      setLoading(false)
    }
  }

  const createUserRole = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        addResult("Create Role Error", null, "No authenticated user")
        return
      }

      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: 'patient'
        })
        .select()

      addResult("Create User Role", data, error)

      if (!error) {
        // Also create patient record
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .insert({
            user_id: user.id,
            name: user.email || 'Test User',
            email: user.email || ''
          })
          .select()

        addResult("Create Patient Record", patientData, patientError)
      }
    } catch (error) {
      addResult("Create Role Error", null, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Database Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={testDatabaseConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Database Connection"}
        </Button>
        
        <Button onClick={createUserRole} disabled={loading} variant="outline">
          Create User Role (Patient)
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{result.test}</CardTitle>
              <CardDescription>{result.timestamp}</CardDescription>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertDescription>
                    <strong>Success:</strong> 
                    <pre className="mt-2 text-sm">{JSON.stringify(result.result, null, 2)}</pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>First, run the complete database setup script in Supabase SQL Editor</li>
          <li>Then click "Test Database Connection" to see what's working</li>
          <li>If user_roles table exists but you have no role, click "Create User Role"</li>
          <li>After fixing issues, go back to the main app</li>
        </ol>
      </div>
    </div>
  )
} 