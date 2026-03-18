export type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  created_by: string; // user_id (UUID)
  created_at: string; // ISO timestamp
};
