-- Create patient_health_intake table
CREATE TABLE IF NOT EXISTS patient_health_intake (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  primary_concern TEXT,
  concern_duration TEXT,
  pain_level INTEGER,
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

-- Create patient_consent_forms table
CREATE TABLE IF NOT EXISTS patient_consent_forms (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_to_treatment BOOLEAN NOT NULL DEFAULT FALSE,
  consent_to_share_info BOOLEAN NOT NULL DEFAULT FALSE,
  consent_to_payment BOOLEAN NOT NULL DEFAULT FALSE,
  signature_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_spaces table
CREATE TABLE IF NOT EXISTS gym_spaces (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  size_sqft INTEGER,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  equipment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create space_bookings table
CREATE TABLE IF NOT EXISTS space_bookings (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES gym_spaces(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_health_intake_patient_id ON patient_health_intake(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_patient_id ON patient_consent_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_gym_spaces_gym_id ON gym_spaces(gym_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_space_id ON space_bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_doctor_id ON space_bookings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_space_bookings_date ON space_bookings(booking_date);
