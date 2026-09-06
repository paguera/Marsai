export interface Collaborator {
  id: number;
  gender: "Male" | "Female" | "Other";
  firstname: string;
  lastname: string;
  email?: string;
  job?: string;
  contribution?: string;
  birthdate: Date;
  country: string;
  region?: string;
  city?: string;
  address?: string;
  zipcode?: string;
  phone: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  created_at: Date;
  movie_id: number;
}
