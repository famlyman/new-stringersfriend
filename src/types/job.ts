export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'picked_up';

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  racquet_id: string;
  job_type: string;
  job_status: JobStatus;
  job_notes?: string;
  due_date?: string;
  completed_date?: string;
  stringer_id: string;
}

export interface JobFormData {
  client_id: string;
  racquet_id: string;
  racquet_brand_id: string;
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
