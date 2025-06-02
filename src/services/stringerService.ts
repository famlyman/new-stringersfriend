import { Stringer } from '../types/stringer';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://your-api-url.com';

export const fetchStringers = async (): Promise<Stringer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stringers`);
    if (!response.ok) {
      throw new Error('Failed to fetch stringers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stringers:', error);
    throw error;
  }
};

export const searchStringers = async (query: string, specialty?: string): Promise<Stringer[]> => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (specialty) params.append('specialty', specialty);

    const response = await fetch(`${API_BASE_URL}/api/stringers/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search stringers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching stringers:', error);
    throw error;
  }
};

export const fetchStringerById = async (id: string): Promise<Stringer> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stringers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stringer');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stringer:', error);
    throw error;
  }
};
