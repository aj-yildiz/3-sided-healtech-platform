-- Create tables for file storage

-- Medical records for patients
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_type VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical documents uploaded by doctors for patients
CREATE TABLE IF NOT EXISTS medical_documents (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gym images
CREATE TABLE IF NOT EXISTS gym_images (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gym amenities
CREATE TABLE IF NOT EXISTS gym_amenities (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add profile_image column to users tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS profile_image TEXT;
