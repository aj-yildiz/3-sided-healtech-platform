-- Create medical_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    record_type VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);

-- Set up Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Patients can view their own records
CREATE POLICY IF NOT EXISTS patient_select_own_records ON public.medical_records
    FOR SELECT
    USING (patient_id IN (
        SELECT id FROM public.patients
        WHERE user_id = auth.uid()
    ));

-- Patients can insert their own records
CREATE POLICY IF NOT EXISTS patient_insert_own_records ON public.medical_records
    FOR INSERT
    WITH CHECK (patient_id IN (
        SELECT id FROM public.patients
        WHERE user_id = auth.uid()
    ));

-- Patients can update their own records
CREATE POLICY IF NOT EXISTS patient_update_own_records ON public.medical_records
    FOR UPDATE
    USING (patient_id IN (
        SELECT id FROM public.patients
        WHERE user_id = auth.uid()
    ));

-- Patients can delete their own records
CREATE POLICY IF NOT EXISTS patient_delete_own_records ON public.medical_records
    FOR DELETE
    USING (patient_id IN (
        SELECT id FROM public.patients
        WHERE user_id = auth.uid()
    ));

-- Doctors can view records of their patients
CREATE POLICY IF NOT EXISTS doctor_select_patient_records ON public.medical_records
    FOR SELECT
    USING (patient_id IN (
        SELECT DISTINCT a.patient_id FROM public.appointments a
        JOIN public.doctors d ON a.doctor_id = d.id
        WHERE d.user_id = auth.uid()
    ));

-- Admins can view all records
CREATE POLICY IF NOT EXISTS admin_select_all_records ON public.medical_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.medical_records_id_seq TO authenticated;
