-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.brands (
  id bigint NOT NULL,
  name text NOT NULL UNIQUE,
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  notes text,
  default_tension_main numeric,
  default_tension_cross numeric,
  stringer_id uuid,
  preferred_main_brand_id bigint,
  preferred_main_model_id bigint,
  preferred_cross_brand_id bigint,
  preferred_cross_model_id bigint,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT fk_preferred_main_string_brand FOREIGN KEY (preferred_main_brand_id) REFERENCES public.string_brand(id),
  CONSTRAINT fk_preferred_main_string_model FOREIGN KEY (preferred_main_model_id) REFERENCES public.string_model(id),
  CONSTRAINT fk_preferred_cross_string_brand FOREIGN KEY (preferred_cross_brand_id) REFERENCES public.string_brand(id),
  CONSTRAINT clients_stringer_id_fkey FOREIGN KEY (stringer_id) REFERENCES public.stringers(id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT fk_preferred_cross_string_model FOREIGN KEY (preferred_cross_model_id) REFERENCES public.string_model(id)
);
CREATE TABLE public.job_stringing_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  job_id uuid NOT NULL,
  tension_main numeric,
  tension_cross numeric,
  price numeric,
  main_string_model_id bigint,
  cross_string_model_id bigint,
  CONSTRAINT job_stringing_details_pkey PRIMARY KEY (id),
  CONSTRAINT fk_job FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT fk_job_main_string_model FOREIGN KEY (main_string_model_id) REFERENCES public.string_model(id),
  CONSTRAINT fk_job_cross_string_model FOREIGN KEY (cross_string_model_id) REFERENCES public.string_model(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  racquet_id uuid NOT NULL,
  job_type USER-DEFINED,
  job_status USER-DEFINED,
  job_notes text,
  due_date date,
  completed_date date,
  stringer_id uuid NOT NULL,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_stringer_id_fkey FOREIGN KEY (stringer_id) REFERENCES auth.users(id),
  CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT jobs_racquet_id_fkey FOREIGN KEY (racquet_id) REFERENCES public.racquets(id),
  CONSTRAINT fk_racquet FOREIGN KEY (racquet_id) REFERENCES public.racquets(id)
);
CREATE TABLE public.models (
  id bigint NOT NULL,
  brand_id bigint NOT NULL,
  name text NOT NULL,
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT models_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  website text,
  bio text,
  role USER-DEFINED,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.racquets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  brand_id bigint NOT NULL,
  model_id bigint NOT NULL,
  head_size integer,
  string_pattern text,
  weight_grams integer,
  balance_point text,
  stiffness_rating text,
  length_cm integer,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  last_stringing_date date,
  stringing_notes text,
  qr_code_data text,
  CONSTRAINT racquets_pkey PRIMARY KEY (id),
  CONSTRAINT racquets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT racquets_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT racquets_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.string_brand (
  id bigint NOT NULL,
  name character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT string_brand_pkey PRIMARY KEY (id)
);
CREATE TABLE public.string_inventory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  gauge text NOT NULL,
  color text NOT NULL,
  length_feet numeric NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 1,
  cost_per_set numeric NOT NULL,
  stringer_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  model_id bigint,
  CONSTRAINT string_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT fk_string_brand FOREIGN KEY (brand_id) REFERENCES public.string_brand(id),
  CONSTRAINT fk_string_model FOREIGN KEY (model_id) REFERENCES public.string_model(id),
  CONSTRAINT fk_string_inventory_stringer FOREIGN KEY (stringer_id) REFERENCES public.stringers(id)
);
CREATE TABLE public.string_model (
  id bigint NOT NULL,
  name character varying NOT NULL,
  brand_id bigint NOT NULL,
  type_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT string_model_pkey PRIMARY KEY (id),
  CONSTRAINT string_model_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.string_brand(id),
  CONSTRAINT string_model_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.string_type(id)
);
CREATE TABLE public.string_type (
  id bigint NOT NULL,
  name character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT string_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stringer_services (
  stringer_id uuid NOT NULL,
  service_id uuid NOT NULL,
  custom_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stringer_services_pkey PRIMARY KEY (stringer_id, service_id),
  CONSTRAINT stringer_services_stringer_id_fkey FOREIGN KEY (stringer_id) REFERENCES public.stringers(id),
  CONSTRAINT stringer_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.stringers (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  shop_name text NOT NULL,
  phone_number text NOT NULL,
  address text,
  business_hours jsonb,
  logo_url text,
  is_verified boolean DEFAULT false,
  stringing_experience text,
  pricing jsonb,
  CONSTRAINT stringers_pkey PRIMARY KEY (id),
  CONSTRAINT stringers_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);