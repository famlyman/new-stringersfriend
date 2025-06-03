-- Drop existing tables and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.strings;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.stringers;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    website TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('stringer', 'customer'))
);

-- Create stringers table
CREATE TABLE public.stringers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    shop_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    business_hours JSONB,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    stringing_experience TEXT,
    services_offered TEXT[],
    pricing JSONB
);

-- Create strings table
CREATE TABLE public.strings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    stringer_id UUID REFERENCES public.stringers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('natural', 'synthetic', 'hybrid', 'polyester', 'multifilament')),
    gauge TEXT,
    color TEXT,
    price NUMERIC NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    specifications JSONB,
    is_active BOOLEAN DEFAULT true
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    default_string_id TEXT,
    default_tension_main NUMERIC,
    default_tension_cross NUMERIC
);

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stringers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Stringers policies
CREATE POLICY "Stringers are viewable by everyone"
    ON public.stringers FOR SELECT
    USING (true);

CREATE POLICY "Stringers can insert their own data"
    ON public.stringers FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Stringers can update their own data"
    ON public.stringers FOR UPDATE
    USING (auth.uid() = id);

-- Strings policies
CREATE POLICY "Strings are viewable by everyone"
    ON public.strings FOR SELECT
    USING (true);

CREATE POLICY "Stringers can insert their own strings"
    ON public.strings FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM public.stringers WHERE id = stringer_id
    ));

CREATE POLICY "Stringers can update their own strings"
    ON public.strings FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.stringers WHERE id = stringer_id
    ));

CREATE POLICY "Stringers can delete their own strings"
    ON public.strings FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM public.stringers WHERE id = stringer_id
    ));

-- Clients policies
CREATE POLICY "Clients are viewable by their owner"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Creating profile for user %', NEW.id;
    
    -- Simple insert with minimal fields
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        updated_at
    ) VALUES (
        NEW.id,
        split_part(NEW.email, '@', 1),
        split_part(NEW.email, '@', 1),
        NOW()
    );

    RAISE NOTICE 'Profile created successfully for user %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE WARNING 'Error in handle_new_user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 