export interface Anime {
    id: number;
    name: string;
    name_alternative: string | null;
    short_name: string | null;
    slug: string;
    type: string;
    status: number;
    views: number;
    aired: string | null;
    premiered: string | null;
    broadcast: number | null;
    genres: string | null;
    vote_average: number;
    rating: string | null;
    popularity: number;
    poster: string | null;
    banner: string | null;
    overview: string | null;
    mal_id: number | null;
    tmdb_id: number | null;
    slug_tio: string | null;
    active_tio: boolean | number | null;
    created_at: string;
    updated_at: string;
}



export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

export interface AnimeFilters {
    search?: string;
    status?: string;
    type?: string;
}
