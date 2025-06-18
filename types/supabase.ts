export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          date_of_birth: string
          gender: string
          blood_type: string
          medical_history: string | null
          allergies: string | null
          current_medications: string | null
          current_conditions: string | null
          credit_card_info: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          date_of_birth: string
          gender: string
          blood_type: string
          medical_history?: string | null
          allergies?: string | null
          current_medications?: string | null
          current_conditions?: string | null
          credit_card_info: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          date_of_birth?: string
          gender?: string
          blood_type?: string
          medical_history?: string | null
          allergies?: string | null
          current_medications?: string | null
          current_conditions?: string | null
          credit_card_info?: string
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          specialization: string | null
          license_number: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          specialization?: string | null
          license_number: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          specialization?: string | null
          license_number?: string
          created_at?: string
        }
      }
      gyms: {
        Row: {
          id: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      gym_availability: {
        Row: {
          id: number
          gym_id: number
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: number
          gym_id: number
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: number
          gym_id?: number
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: number
          patient_id: number
          doctor_id: number
          gym_id: number
          appointment_date: string
          appointment_time: string
          appointment_type: string
          appointment_status: string
          appointment_notes: string | null
          created_at: string
          service_type_id: number | null
          price: number | null
          insurance_claim_id: number | null
        }
        Insert: {
          id?: number
          patient_id: number
          doctor_id: number
          gym_id: number
          appointment_date: string
          appointment_time: string
          appointment_type: string
          appointment_status: string
          appointment_notes?: string | null
          created_at?: string
          service_type_id?: number | null
          price?: number | null
          insurance_claim_id?: number | null
        }
        Update: {
          id?: number
          patient_id?: number
          doctor_id?: number
          gym_id?: number
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          appointment_status?: string
          appointment_notes?: string | null
          created_at?: string
          service_type_id?: number | null
          price?: number | null
          insurance_claim_id?: number | null
        }
      }
      admin: {
        Row: {
          id: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
        }
      }
      doctor_invites: {
        Row: {
          id: number
          email: string
          token: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: number
          email: string
          token: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: number
          email?: string
          token?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
      user_roles: {
        Row: {
          id: number
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      service_types: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      doctor_locations: {
        Row: {
          id: number
          doctor_id: number
          gym_id: number
          created_at: string
        }
        Insert: {
          id?: number
          doctor_id: number
          gym_id: number
          created_at?: string
        }
        Update: {
          id?: number
          doctor_id?: number
          gym_id?: number
          created_at?: string
        }
      }
      doctor_services: {
        Row: {
          id: number
          doctor_id: number
          service_type_id: number
          created_at: string
        }
        Insert: {
          id?: number
          doctor_id: number
          service_type_id: number
          created_at?: string
        }
        Update: {
          id?: number
          doctor_id?: number
          service_type_id?: number
          created_at?: string
        }
      }
      doctor_availability: {
        Row: {
          id: number
          doctor_id: number
          gym_id: number
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: number
          doctor_id: number
          gym_id: number
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: number
          doctor_id?: number
          gym_id?: number
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      insurance_providers: {
        Row: {
          id: number
          name: string
          api_key: string | null
          api_endpoint: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          api_key?: string | null
          api_endpoint?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          api_key?: string | null
          api_endpoint?: string | null
          created_at?: string
        }
      }
      patient_insurance: {
        Row: {
          id: number
          patient_id: number
          insurance_provider_id: number
          policy_number: string
          group_number: string | null
          coverage_details: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          patient_id: number
          insurance_provider_id: number
          policy_number: string
          group_number?: string | null
          coverage_details?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          patient_id?: number
          insurance_provider_id?: number
          policy_number?: string
          group_number?: string | null
          coverage_details?: Json | null
          created_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: number
          appointment_id: number | null
          amount: number
          status: string
          payment_method: string | null
          transaction_reference: string | null
          created_at: string
        }
        Insert: {
          id?: number
          appointment_id?: number | null
          amount: number
          status?: string
          payment_method?: string | null
          transaction_reference?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          appointment_id?: number | null
          amount?: number
          status?: string
          payment_method?: string | null
          transaction_reference?: string | null
          created_at?: string
        }
      }
      payment_distributions: {
        Row: {
          id: number
          transaction_id: number
          recipient_type: string
          recipient_id: number
          amount: number
          status: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          transaction_id: number
          recipient_type: string
          recipient_id: number
          amount: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          transaction_id?: number
          recipient_type?: string
          recipient_id?: number
          amount?: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
      }
      insurance_claims: {
        Row: {
          id: number
          appointment_id: number | null
          patient_insurance_id: number
          claim_amount: number
          status: string
          claim_reference: string | null
          response_details: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          appointment_id?: number | null
          patient_insurance_id: number
          claim_amount: number
          status?: string
          claim_reference?: string | null
          response_details?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          appointment_id?: number | null
          patient_insurance_id?: number
          claim_amount?: number
          status?: string
          claim_reference?: string | null
          response_details?: Json | null
          created_at?: string
        }
      }
    }
  }
}
