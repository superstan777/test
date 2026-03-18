export type Rating = {
  id: string;
  restaurant_id: string;
  user_id: string;
  score: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  created_at: string; // ISO timestamp
};
