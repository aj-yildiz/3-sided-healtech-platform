-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
CREATE POLICY patient_select_own_records ON public.medical_records
    FOR SELECT
    USING (patient_id IN (
        SELECT id FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'patient'
    ));

-- Patients can insert their own records
CREATE POLICY patient_insert_own_records ON public.medical_records
    FOR INSERT
    WITH CHECK (patient_id IN (
        SELECT id FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'patient'
    ));

-- Patients can update their own records
CREATE POLICY patient_update_own_records ON public.medical_records
    FOR UPDATE
    USING (patient_id IN (
        SELECT id FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'patient'
    ));

-- Patients can delete their own records
CREATE POLICY patient_delete_own_records ON public.medical_records
    FOR DELETE
    USING (patient_id IN (
        SELECT id FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'patient'
    ));

-- Doctors can view records of their patients
CREATE POLICY doctor_select_patient_records ON public.medical_records
    FOR SELECT
    USING (patient_id IN (
        SELECT p.id FROM public.profiles p
        JOIN public.appointments a ON p.id = a.patient_id
        JOIN public.profiles dp ON a.doctor_id = dp.id
        WHERE dp.user_id = auth.uid() AND dp.role = 'doctor'
    ));

-- Admins can view all records
CREATE POLICY admin_select_all_records ON public.medical_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.medical_records_id_seq TO authenticated;
