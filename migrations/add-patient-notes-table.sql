-- Create patient_notes table
CREATE TABLE IF NOT EXISTS patient_notes (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Add indexes for faster queries
  CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_notes_doctor_id ON patient_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON patient_notes(patient_id);
