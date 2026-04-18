import { UserRole } from "@/types/roles";
import { Parish } from "@/interfaces/Parish";

export interface User {
  id: string;
  name: string;
  email: string;
  parish_id: string | null;
  sector_id: string | null;
  diocese_id: string | null;
  active: boolean;
  parish?: Parish;
  /** Spatie Permission returns either plain strings or role objects. */
  roles: UserRole[];
  movement_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: UserRole;
  diocese_id?: string | null;
  sector_id?: string | null;
  parish_id?: string | null;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
