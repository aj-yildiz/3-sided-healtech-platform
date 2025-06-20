-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR VASTIS MVP
-- =====================================================
-- Run this script in Supabase SQL Editor to set up the complete database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

-- Drop existing types if they exist (for clean reinstall)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'gym', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- =====================================================
-- 2. CREATE CORE TABLES
-- =====================================================

-- User roles table (links auth.users to roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(255),
    medical_conditions TEXT,
    allergies TEXT,
    current_medications TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(20),
    license_number VARCHAR(255) UNIQUE,
    specialization VARCHAR(255) DEFAULT '',
    years_of_experience INTEGER,
    education TEXT,
    certifications TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Gyms table
CREATE TABLE IF NOT EXISTS public.gyms (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(20),
    description TEXT,
    address TEXT DEFAULT '',
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    website VARCHAR(255),
    operating_hours JSONB,
    amenities TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Service types table
CREATE TABLE IF NOT EXISTS public.service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table (updated with service_type_id)
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE,
    gym_id INTEGER REFERENCES public.gyms(id) ON DELETE SET NULL,
    service_type_id INTEGER REFERENCES public.service_types(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    consultation_fee DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor availability table
CREATE TABLE IF NOT EXISTS public.doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE,
    gym_id INTEGER REFERENCES public.gyms(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gym spaces table
CREATE TABLE IF NOT EXISTS public.gym_spaces (
    id SERIAL PRIMARY KEY,
    gym_id INTEGER REFERENCES public.gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER,
    size_sqft INTEGER,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    equipment TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space bookings table
CREATE TABLE IF NOT EXISTS public.space_bookings (
    id SERIAL PRIMARY KEY,
    space_id INTEGER REFERENCES public.gym_spaces(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status DEFAULT 'pending',
    total_cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE SET NULL,
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

-- Patient notes table
CREATE TABLE IF NOT EXISTS public.patient_notes (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient health intake table
CREATE TABLE IF NOT EXISTS public.patient_health_intake (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    primary_concern TEXT,
    concern_duration TEXT,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    medications TEXT,
    allergies TEXT,
    past_medical_history TEXT,
    surgeries TEXT,
    conditions TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient consent forms table
CREATE TABLE IF NOT EXISTS public.patient_consent_forms (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    form_type VARCHAR(255) NOT NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    form_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File storage table
CREATE TABLE IF NOT EXISTS public.file_storage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

-- Doctors indexes
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_is_available ON public.doctors(is_available);

-- Gyms indexes
CREATE INDEX IF NOT EXISTS idx_gyms_user_id ON public.gyms(user_id);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms(city);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_gym_id ON public.appointments(gym_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Medical records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_health_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_storage ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- User roles policies
DROP POLICY IF EXISTS user_roles_select_policy ON public.user_roles;
CREATE POLICY user_roles_select_policy ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_roles_insert_policy ON public.user_roles;
CREATE POLICY user_roles_insert_policy ON public.user_roles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Service types policies (readable by all authenticated users)
DROP POLICY IF EXISTS service_types_select_policy ON public.service_types;
CREATE POLICY service_types_select_policy ON public.service_types
    FOR SELECT USING (true);

-- Patients policies
DROP POLICY IF EXISTS patients_select_own ON public.patients;
CREATE POLICY patients_select_own ON public.patients
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS patients_update_own ON public.patients;
CREATE POLICY patients_update_own ON public.patients
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS patients_insert_own ON public.patients;
CREATE POLICY patients_insert_own ON public.patients
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Doctors policies
DROP POLICY IF EXISTS doctors_select_own ON public.doctors;
CREATE POLICY doctors_select_own ON public.doctors
    FOR SELECT USING (user_id = auth.uid() OR true); -- Allow all to see doctors for booking

DROP POLICY IF EXISTS doctors_update_own ON public.doctors;
CREATE POLICY doctors_update_own ON public.doctors
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS doctors_insert_own ON public.doctors;
CREATE POLICY doctors_insert_own ON public.doctors
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Gyms policies
DROP POLICY IF EXISTS gyms_select_all ON public.gyms;
CREATE POLICY gyms_select_all ON public.gyms
    FOR SELECT USING (true); -- Allow all to see gyms

DROP POLICY IF EXISTS gyms_update_own ON public.gyms;
CREATE POLICY gyms_update_own ON public.gyms
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS gyms_insert_own ON public.gyms;
CREATE POLICY gyms_insert_own ON public.gyms
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Appointments policies
DROP POLICY IF EXISTS appointments_select_related ON public.appointments;
CREATE POLICY appointments_select_related ON public.appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
        gym_id IN (SELECT id FROM public.gyms WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS appointments_insert_patient ON public.appointments;
CREATE POLICY appointments_insert_patient ON public.appointments
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS appointments_update_related ON public.appointments;
CREATE POLICY appointments_update_related ON public.appointments
    FOR UPDATE USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );

-- Medical records policies
DROP POLICY IF EXISTS medical_records_select_own ON public.medical_records;
CREATE POLICY medical_records_select_own ON public.medical_records
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS medical_records_insert_own ON public.medical_records;
CREATE POLICY medical_records_insert_own ON public.medical_records
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

-- File storage policies
DROP POLICY IF EXISTS file_storage_select_own ON public.file_storage;
CREATE POLICY file_storage_select_own ON public.file_storage
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS file_storage_insert_own ON public.file_storage;
CREATE POLICY file_storage_insert_own ON public.file_storage
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.gyms TO authenticated;
GRANT SELECT ON public.service_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctor_availability TO authenticated;
GRANT SELECT ON public.gym_spaces TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.space_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.medical_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_health_intake TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_consent_forms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.file_storage TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================

-- Insert default service types
INSERT INTO public.service_types (name, description, duration_minutes, price) VALUES
    ('General Consultation', 'General health consultation and assessment', 60, 100.00),
    ('Physical Therapy', 'Physical therapy and rehabilitation session', 60, 120.00),
    ('Sports Medicine', 'Sports medicine consultation and treatment', 45, 150.00),
    ('Rehabilitation', 'Comprehensive rehabilitation therapy', 90, 180.00),
    ('Wellness Check', 'General wellness examination and health screening', 30, 80.00),
    ('Injury Assessment', 'Assessment and diagnosis of sports injuries', 45, 130.00),
    ('Movement Analysis', 'Biomechanical movement analysis', 75, 160.00),
    ('Pain Management', 'Pain management consultation and treatment', 60, 140.00)
ON CONFLICT (name) DO NOTHING;

-- Insert sample gym spaces (you can customize these)
-- Note: This assumes you have at least one gym in your system
-- You'll need to update the gym_id values after creating actual gym records

-- =====================================================
-- 8. CREATE HELPFUL FUNCTIONS
-- =====================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role::TEXT FROM public.user_roles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid()) = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gyms_updated_at ON public.gyms;
CREATE TRIGGER update_gyms_updated_at
    BEFORE UPDATE ON public.gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. FINAL COMMIT
-- =====================================================

COMMIT;

-- =====================================================
-- POST-SETUP INSTRUCTIONS
-- =====================================================

/*
AFTER RUNNING THIS SCRIPT:

1. Create your first user role by running:
   INSERT INTO public.user_roles (user_id, role) 
   VALUES (auth.uid(), 'patient'); -- or 'doctor', 'gym', 'admin'

2. Create your profile in the corresponding table:
   For patients:
   INSERT INTO public.patients (user_id, name, email) 
   VALUES (auth.uid(), 'Your Name', 'your@email.com');

3. To check your user ID, run:
   SELECT auth.uid();

4. To verify the setup, run:
   SELECT * FROM public.user_roles WHERE user_id = auth.uid();

5. Test the application - it should now work without database errors!
*/ 