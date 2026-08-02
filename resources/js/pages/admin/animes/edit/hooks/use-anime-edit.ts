import { useEffect, useState } from 'react';
import type { Anime } from '@/types/anime';
import { normalizeRating } from '../utils';
import { useAltTitles } from './use-alt-titles';
import { useAnimeSubmit } from './use-anime-submit';
import { useMalSync } from './use-mal-sync';

type AnimeFormData = {
    name: string;
    genres: string;
    slug: string;
    rating: string;
    mal_id: string | number;
    tmdb_id: string | number;
    [key: string]: unknown;
};

interface UseAnimeEditProps {
    anime: Anime;
    data: AnimeFormData;
    setData: (key: string | Partial<AnimeFormData> | ((prev: AnimeFormData) => AnimeFormData), value?: unknown) => void;
    put: (url: string, options?: Record<string, unknown>) => void;
    transform: (callback: (data: Record<string, unknown>) => Record<string, unknown>) => void;
}

export function useAnimeEdit({ anime, data, setData, put, transform }: UseAnimeEditProps) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>(anime.genres ? anime.genres.split(',') : []);

    const altTitlesApi = useAltTitles({
        animeNameAlternative: anime.name_alternative,
        currentName: anime.name,
        onChange: (joined) => setData('name_alternative', joined),
    });

    const malSyncApi = useMalSync({
        currentName: data.name,
        selectedGenres,
        setSelectedGenres,
        setAltTitles: altTitlesApi.setAltTitles,
        setData: setData as unknown as (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
    });

    const submitApi = useAnimeSubmit({ anime, data, setData, transform, put });

    // Normalize the persisted rating once on mount (older records may store raw TMDB/MAL strings).
    useEffect(() => {
        const normalized = normalizeRating(data.rating);
        if (normalized !== data.rating) {
            setData('rating', normalized);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-hydrate the whole form when navigating directly between two different anime edit pages
    // (Inertia reuses this component instance rather than remounting it).
    useEffect(() => {
        setSelectedGenres(anime.genres ? anime.genres.split(',') : []);

        setData({
            name: anime.name || '',
            name_alternative: anime.name_alternative || '',
            genres: anime.genres || '',
            slug: anime.slug || '',
            overview: anime.overview || '',
            type: anime.type || 'TV',
            status: anime.status.toString(),
            aired: anime.aired ? anime.aired.substring(0, 10) : '',
            premiered: anime.premiered || '',
            popularity: anime.popularity || 0,
            rating: anime.rating || 'Apto para mayores de 13 años',
            broadcast: anime.broadcast?.toString() || '0',
            tmdb_id: anime.tmdb_id || '',
            mal_id: anime.mal_id || '',
            short_name: anime.short_name || '',
            vote_average: anime.vote_average || 0,
            poster: anime.poster || '',
            banner: anime.banner || '',
            slug_tio: anime.slug_tio || '',
            active_tio: anime.active_tio || false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anime.id]);

    useEffect(() => {
        setData('genres', selectedGenres.join(','));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGenres]);

    const toggleGenre = (slug: string) => {
        setSelectedGenres((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    };

    return {
        ...altTitlesApi,
        ...malSyncApi,
        ...submitApi,
        selectedGenres,
        toggleGenre,
        syncWithMal: () => malSyncApi.syncWithMal(data.mal_id),
    };
}
