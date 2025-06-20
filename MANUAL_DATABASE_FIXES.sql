-- Manual Database Fixes for Vastis MVP
-- Run these commands in the Supabase SQL Editor

-- 1. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create service_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add service_type_id column to appointments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' 
                   AND column_name = 'service_type_id') THEN
        ALTER TABLE public.appointments 
        ADD COLUMN service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Insert default service types
INSERT INTO public.service_types (name, description, duration_minutes, price) 
VALUES 
    ('General Consultation', 'General health consultation', 60, 100.00),
    ('Physical Therapy', 'Physical therapy session', 60, 120.00),
    ('Sports Medicine', 'Sports medicine consultation', 45, 150.00),
    ('Rehabilitation', 'Rehabilitation therapy', 90, 180.00),
    ('Wellness Check', 'General wellness examination', 30, 80.00)
ON CONFLICT (name) DO NOTHING;

-- 5. Enable RLS on new tables
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for service_types (allow all authenticated users to read)
DROP POLICY IF EXISTS service_types_select_policy ON public.service_types;
CREATE POLICY service_types_select_policy ON public.service_types
    FOR SELECT
    USING (true);

-- 7. Create policies for user_roles (users can only see their own role)
DROP POLICY IF EXISTS user_roles_select_policy ON public.user_roles;
CREATE POLICY user_roles_select_policy ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_roles_insert_policy ON public.user_roles;
CREATE POLICY user_roles_insert_policy ON public.user_roles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 8. Grant necessary permissions
GRANT SELECT ON public.service_types TO authenticated;
GRANT SELECT, INSERT ON public.user_roles TO authenticated;

-- 9. Insert a test user role (replace with your actual user ID)
-- To find your user ID, run: SELECT auth.uid();
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'patient');

COMMIT; 