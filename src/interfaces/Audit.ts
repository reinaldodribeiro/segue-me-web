export interface AuditLog {
  id: string;
  action: string;
  description: string;
  model_type: string;
  model_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}
