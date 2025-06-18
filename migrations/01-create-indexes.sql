-- Create indexes for better performance

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON public.patients(profile_id);

-- Doctors indexes
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_profile_id ON public.doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON public.doctors(is_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_is_available ON public.doctors(is_available);

-- Gyms indexes
CREATE INDEX IF NOT EXISTS idx_gyms_user_id ON public.gyms(user_id);
CREATE INDEX IF NOT EXISTS idx_gyms_profile_id ON public.gyms(profile_id);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_is_verified ON public.gyms(is_verified);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_gym_id ON public.appointments(gym_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Doctor availability indexes
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON public.doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_gym_id ON public.doctor_availability(gym_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_day ON public.doctor_availability(day_of_week);

-- Medical records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_record_type ON public.medical_records(record_type);

-- Patient notes indexes
CREATE INDEX IF NOT EXISTS idx_patient_notes_doctor_id ON public.patient_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON public.patient_notes(patient_id);

-- Health intake indexes
CREATE INDEX IF NOT EXISTS idx_patient_health_intake_patient_id ON public.patient_health_intake(patient_id);

-- Consent forms indexes
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_patient_id ON public.patient_consent_forms(patient_id);

-- Gym spaces indexes
CREATE INDEX IF NOT EXISTS idx_gym_spaces_gym_id ON public.gym_spaces(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_spaces_is_available ON public.gym_spaces(is_available);

-- Space bookings indexes
CREATE INDEX IF NOT EXISTS idx_space_bookings_space_id ON public.space_bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_doctor_id ON public.space_bookings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_date ON public.space_bookings(booking_date);

-- Invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at);
