export type UserRole = 'stringer' | 'customer';

export interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface StringerProfile extends BaseUser {
  role: 'stringer';
  business_name: string;
  business_address?: string;
  phone_number: string;
  is_verified: boolean;
  stringing_experience?: string;
  services_offered?: string[];
  pricing?: {
    base_price: number;
    premium_strings_price?: number;
    rush_service_price?: number;
  };
}

export interface CustomerProfile extends BaseUser {
  role: 'customer';
  phone_number?: string;
  preferred_strings?: string[];
  stringing_preferences?: {
    tension_main?: number;
    tension_cross?: number;
    pattern?: string;
  };
  favorite_stringers?: string[]; // Array of stringer IDs
}

export type UserProfile = StringerProfile | CustomerProfile; 