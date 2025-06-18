-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_health_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patients policies
CREATE POLICY "Patients can view their own data" ON public.patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON public.patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON public.patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Doctors policies
CREATE POLICY "Doctors can view their own data" ON public.doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own data" ON public.doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own data" ON public.doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view verified doctors" ON public.doctors
    FOR SELECT USING (is_verified = true);

-- Gyms policies
CREATE POLICY "Gyms can view their own data" ON public.gyms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gyms can update their own data" ON public.gyms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Gyms can insert their own data" ON public.gyms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view verified gyms" ON public.gyms
    FOR SELECT USING (is_verified = true);

-- Appointments policies
CREATE POLICY "Patients can view their appointments" ON public.appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

-- Medical records policies
CREATE POLICY "Patients can view their own records" ON public.medical_records
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors can view shared records" ON public.medical_records
    FOR SELECT USING (
        is_shared = true AND doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients can insert their own records" ON public.medical_records
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
