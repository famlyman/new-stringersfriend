export interface Stringer {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  reviewCount: number;
  distance: string;
  location: string;
  specialties: string[];
  image: string;
  bio?: string;
  email?: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  certifications?: string[];
  services?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  }>;
}
