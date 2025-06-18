-- Check if medical_records table exists, if not create it
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    record_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_url TEXT,
    file_type VARCHAR(100),
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_record_type ON public.medical_records(record_type);

-- Set up Row Level Security (RLS)
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Patients can view their own records" ON public.medical_records;
    DROP POLICY IF EXISTS "Doctors can view records of their patients" ON public.medical_records;
    DROP POLICY IF EXISTS "Patients can insert their own records" ON public.medical_records;
    DROP POLICY IF EXISTS "Doctors can insert records for their patients" ON public.medical_records;
    DROP POLICY IF EXISTS "Patients can update their own records" ON public.medical_records;
    DROP POLICY IF EXISTS "Doctors can update records of their patients" ON public.medical_records;
    
    -- Create new policies
    CREATE POLICY "Patients can view their own records" 
    ON public.medical_records FOR SELECT 
    USING (auth.uid() = patient_id);
    
    CREATE POLICY "Doctors can view records of their patients" 
    ON public.medical_records FOR SELECT 
    USING (auth.uid() = doctor_id OR is_shared = TRUE);
    
    CREATE POLICY "Patients can insert their own records" 
    ON public.medical_records FOR INSERT 
    WITH CHECK (auth.uid() = patient_id);
    
    CREATE POLICY "Doctors can insert records for their patients" 
    ON public.medical_records FOR INSERT 
    WITH CHECK (auth.uid() = doctor_id);
    
    CREATE POLICY "Patients can update their own records" 
    ON public.medical_records FOR UPDATE 
    USING (auth.uid() = patient_id);
    
    CREATE POLICY "Doctors can update records of their patients" 
    ON public.medical_records FOR UPDATE 
    USING (auth.uid() = doctor_id);
END
$$;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.medical_records TO authenticated;
