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
  head_size?: number;
  weight_grams?: number;
  balance_point?: string;
  string_pattern?: string;
  name?: string;
} 