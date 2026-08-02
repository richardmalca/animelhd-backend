import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { expandAltTitles, normalizeRating } from '../utils';

type MalDetailsResponse = {
    name: string;
    vote_average: number;
    popularity: number;
    rating: string;
    premiered: string;
    altTitles: string[];
    mappedGenres: string[];
    status: number;
    broadcast: number;
};

type UseMalSyncArgs = {
    currentName: string;
    selectedGenres: string[];
    setSelectedGenres: (genres: string[]) => void;
    setAltTitles: (titles: string[]) => void;
    setData: (data: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
};

export function useMalSync({ currentName, selectedGenres, setSelectedGenres, setAltTitles, setData }: UseMalSyncArgs) {
    const [isMalSearchOpen, setIsMalSearchOpen] = useState(false);
    const [malSearchQuery, setMalSearchQuery] = useState(currentName);
    const [malResults, setMalResults] = useState<any[]>([]);
    const [isSearchingMal, setIsSearchingMal] = useState(false);
    const [isSyncingMal, setIsSyncingMal] = useState(false);

    const searchMal = async () => {
        if (!malSearchQuery.trim()) return;
        setIsSearchingMal(true);
        try {
            const response = await fetch(`/admin/animes/mal-search?query=${encodeURIComponent(malSearchQuery)}`);
            const data = await response.json();
            setMalResults(data.data || []);
        } catch {
            toast.error('Error al buscar en MyAnimeList');
        } finally {
            setIsSearchingMal(false);
        }
    };

    useEffect(() => {
        if (isMalSearchOpen) {
            searchMal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMalSearchOpen]);

    const applyMalDetails = (result: MalDetailsResponse, malId?: number) => {
        const mappedRating = normalizeRating(result.rating);
        const combinedGenres =
            result.mappedGenres && result.mappedGenres.length > 0
                ? Array.from(new Set([...selectedGenres, ...result.mappedGenres]))
                : null;

        if (combinedGenres) {
            setSelectedGenres(combinedGenres);
        }

        setData((prev) => ({
            ...prev,
            ...result,
            rating: mappedRating,
            ...(malId ? { mal_id: malId } : {}),
            ...(combinedGenres ? { genres: combinedGenres.join(',') } : {}),
            status: result.status.toString(),
            broadcast: result.broadcast.toString(),
        }));

        if (result.altTitles) {
            setAltTitles(expandAltTitles(result.altTitles));
        }
    };

    const fetchAndApplyMalDetails = async (malId: number) => {
        const response = await fetch(`/admin/animes/mal-details/${malId}`);
        if (!response.ok) throw new Error('Error al obtener detalles');
        return (await response.json()) as MalDetailsResponse;
    };

    const selectMalAnime = async (malAnime: { node: { id: number } }) => {
        const malId = malAnime.node.id;
        setData((prev) => ({ ...prev, mal_id: malId }));
        setIsMalSearchOpen(false);

        setIsSyncingMal(true);
        const toastId = toast.loading('Sincronizando datos de MyAnimeList...');
        try {
            const result = await fetchAndApplyMalDetails(malId);
            applyMalDetails(result, malId);
            toast.success('Datos de MAL cargados en el formulario', { id: toastId });
        } catch {
            toast.error('Error en la sincronización automática', { id: toastId });
        } finally {
            setIsSyncingMal(false);
        }
    };

    const syncWithMal = async (malId: number | string) => {
        if (!malId) {
            toast.error('Vincula primero un ID de MyAnimeList');
            return;
        }

        setIsSyncingMal(true);
        const toastId = toast.loading('Sincronizando con MyAnimeList...');
        try {
            const result = await fetchAndApplyMalDetails(Number(malId));
            applyMalDetails(result);
            toast.success('Datos de MAL cargados en el formulario', { id: toastId });
        } catch {
            toast.error('Error al sincronizar con MAL', { id: toastId });
        } finally {
            setIsSyncingMal(false);
        }
    };

    return {
        isMalSearchOpen,
        setIsMalSearchOpen,
        malSearchQuery,
        setMalSearchQuery,
        malResults,
        isSearchingMal,
        isSyncingMal,
        searchMal,
        selectMalAnime,
        syncWithMal,
    };
}
