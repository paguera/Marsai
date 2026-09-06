export interface MovieCollaborator {
    id: number | string;
    gender: string;
    firstname: string;
    lastname: string;
    email: string;
    job: string;
    contribution: string;
    birthdate: string;
    country: string;
    region: string;
    city: string;
    address: string;
    zipcode: string;
    phone: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    linkedin_url: string;
    twitter_url: string;
    created_at: string;
    movie_id: number | string;
}
export interface MovieCollaboratorFormState {
    gender: string;
    firstname: string;
    lastname: string;
    email: string;
    job: string;
    contribution: string;
    birthdate: string;
    country: string;
    region: string;
    city: string;
    address: string;
    zipcode: string;
    phone: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    linkedin_url: string;
    twitter_url: string;
}

export interface MovieTag {
    id: number | string;
    name: string;
}

export interface MovieRating {
    id: number | string;
    user_id: number | string;
    movie_id: number | string;
    note: number;
    comment: string;
}

export interface Movie {
    id: number | string;
    original_title: string;
    english_title: string;
    submitted_at: string;
    movie_path: string;
    cover_image: string;
    duration: number;
    isHybrid: boolean;
    original_language: string;
    original_synopsis: string;
    english_synopsis: string;
    creative_process: string;
    ia_tools: string;
    hasSubs?: boolean;
    srt?: string | null;
    status?: "Pending" | "Cancelled" | "Accepted";
    average_rating?: number | string | null;
}


export interface MovieFormState {
    original_title: string;
    english_title: string;
    youtube_url: string;
    duration: number;
    isHybrid: boolean;
    original_language: string;
    original_synopsis: string;
    english_synopsis: string;
    creative_process: string;
    ia_tools: string;
    hasSubs: boolean;
}