-- Add missing columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL;

-- Create service_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default service types
INSERT INTO public.service_types (name, description, duration_minutes, price) 
VALUES 
    ('General Consultation', 'General health consultation', 60, 100.00),
    ('Physical Therapy', 'Physical therapy session', 60, 120.00),
    ('Sports Medicine', 'Sports medicine consultation', 45, 150.00),
    ('Rehabilitation', 'Rehabilitation therapy', 90, 180.00),
    ('Wellness Check', 'General wellness examination', 30, 80.00)
ON CONFLICT DO NOTHING;

-- Create user_roles table if it doesn't exist (for the auth context)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on service_types
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Create policy for service_types (allow all authenticated users to read)
CREATE POLICY IF NOT EXISTS service_types_select_policy ON public.service_types
    FOR SELECT
    USING (true);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_roles (users can only see their own role)
CREATE POLICY IF NOT EXISTS user_roles_select_policy ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON public.service_types TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT ON public.user_roles TO authenticated; 