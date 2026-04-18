export interface Diocese {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Sector {
  id: string;
  name: string;
  slug: string;
  diocese_id: string;
  diocese?: Diocese;
  active: boolean;
}

export interface Parish {
  id: string;
  name: string;
  slug: string;
  sector_id: string;
  sector?: Sector;
  logo: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  skills: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParishPayload {
  name: string;
  primary_color?: string;
  secondary_color?: string;
}
