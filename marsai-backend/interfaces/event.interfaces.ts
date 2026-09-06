export interface Event {
  title: string;
  description: string;
  status?: "Scheduled" | "Cancelled" | "Completed";
  start_at: Date;
  duration: number;
  location: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date;
}
