export interface Racquet {
  id: string;
  brand: string;
  model: string;
  brand_id?: string;
  model_id?: string;
  brands?: {
    id: string;
    name: string;
  };
  models?: {
    id: string;
    name: string;
  };
  head_size?: number | null;
  weight_grams?: number | null;
  balance_point?: string | null;
  string_pattern?: string | null;
  name?: string | null;
  notes?: string | null;
  string_tension_mains?: number | string | null;
  string_tension_crosses?: number | string | null;
  string_mains?: string | null;
  string_crosses?: string | null;
  main_string_model_id?: number | string | null;
  cross_string_model_id?: number | string | null;
  client_id?: string | null;
  stringing_notes?: string | null;
  string_date?: string | null;
} 