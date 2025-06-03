export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'picked_up';

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  client_id: string;
  client_name: string;
  racquet_id: string;
  racquet_name: string;
  string_id: string;
  string_name: string;
  tension_main: number;
  tension_cross: number;
  status: JobStatus;
  price: number;
  notes?: string;
  completed_at?: string;
  picked_up_at?: string;
}

export interface JobFormData {
  client_id: string;
  racquet_id: string;
  string_id: string;
  cross_string_id?: string;  // Made optional with '?'
  tension_main: string;
  tension_cross: string;
  price: string;
  notes?: string;
}

export const statusConfig = {
  pending: { color: '#FF9500', icon: 'time-outline', label: 'Pending' },
  in_progress: { color: '#007AFF', icon: 'construct-outline', label: 'In Progress' },
  completed: { color: '#34C759', icon: 'checkmark-done-outline', label: 'Completed' },
  picked_up: { color: '#8E8E93', icon: 'exit-outline', label: 'Picked Up' },
} as const;
