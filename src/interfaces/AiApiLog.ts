export interface AiApiLog {
  id: string;
  action: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  success: boolean;
  error_message: string | null;
  duration_ms: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AiApiLogStats {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  avg_duration_ms: number;
  by_action: {
    action: string;
    calls: number;
    successful: number;
    tokens: number;
    cost_usd: number;
  }[];
  by_model: {
    model: string;
    calls: number;
    tokens: number;
    cost_usd: number;
  }[];
}
