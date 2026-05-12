export interface DashboardStat {
    total: number;
    this_week: number;
}

export interface RecentAnime {
    id: number;
    name: string;
    slug: string;
    poster: string;
    created_at: string;
}


export interface RecentEpisode {
    id: number;
    anime_id: number;
    number: string;
    anime?: {
        id: number;
        name: string;
    };
    created_at: string;
}


export interface DashboardStats {
    animes: DashboardStat;
    episodes: DashboardStat;
    players: DashboardStat;
    genres: DashboardStat;
    users: DashboardStat;
    servers: DashboardStat;
    recent_animes: RecentAnime[];
    recent_episodes: RecentEpisode[];
}
