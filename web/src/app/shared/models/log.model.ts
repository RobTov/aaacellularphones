export interface Log {
  id: string;
  table_name: string;
  action: string;
  record_id: string;
  user_id?: string;
  created_at: string;
}
