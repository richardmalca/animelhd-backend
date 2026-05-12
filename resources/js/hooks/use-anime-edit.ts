import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface UseAnimeEditProps {
    anime: any;
    data: any;
    setData: (key: string | any, value?: any) => void;
    put: (url: string, options?: any) => void;
    transform: (callback: (data: any) => any) => void;
}

export function useAnimeEdit({ anime, data, setData, put, transform }: UseAnimeEditProps) {
    const normalizeForComparison = (text: string) => {
        return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    };

    const [altTitles, setAltTitles] = useState<string[]>(() => {
        if (!anime.name_alternative) return [];
        
        const currentNameNormalized = normalizeForComparison(anime.name || '');
        const titles = anime.name_alternative
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t && normalizeForComparison(t) !== currentNameNormalized);
            
        return titles.filter((item: string, index: number) => 
            titles.findIndex((t: string) => normalizeForComparison(t) === normalizeForComparison(item)) === index
        );
    });
    const [titleInput, setTitleInput] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isMalSearchOpen, setIsMalSearchOpen] = useState(false);
    const [malSearchQuery, setMalSearchQuery] = useState(anime.name);
    const [malResults, setMalResults] = useState<any[]>([]);
    const [isSearchingMal, setIsSearchingMal] = useState(false);
    const [isSyncingMal, setIsSyncingMal] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        anime.genres ? anime.genres.split(',') : []
    );

    const [showSlugConfirm, setShowSlugConfirm] = useState(false);
    const [slugSuggestion, setSlugSuggestion] = useState('');

    const isTmdbChanged = anime.tmdb_id && data.tmdb_id.toString() !== anime.tmdb_id.toString();
    const isMalChanged = anime.mal_id && data.mal_id.toString() !== anime.mal_id.toString();

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    useEffect(() => {
        const normalized = normalizeRating(data.rating);
        if (normalized !== data.rating) {
            setData('rating', normalized);
        }
    }, []);

    useEffect(() => {
        setAltTitles(
            anime.name_alternative
                ? anime.name_alternative
                      .split(',')
                      .map((t: string) => t.trim())
                      .filter(Boolean)
                : []
        );
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
    }, [anime]);

    useEffect(() => {
        setData('name_alternative', altTitles.join(', '));
    }, [altTitles]);

    useEffect(() => {
        setData('genres', selectedGenres.join(','));
    }, [selectedGenres]);

    const toggleGenre = (slug: string) => {
        setSelectedGenres((prev: string[]) =>
            prev.includes(slug)
                ? prev.filter((s: string) => s !== slug)
                : [...prev, slug],
        );
    };

    const handleAddAltTitle = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = titleInput.trim();
            const currentNameNormalized = normalizeForComparison(data.name);
            const valueNormalized = normalizeForComparison(value);
            
            if (value && valueNormalized !== currentNameNormalized) {
                const isDuplicate = altTitles.some((t: string) => normalizeForComparison(t) === valueNormalized);
                if (!isDuplicate) {
                    setAltTitles([...altTitles, value]);
                    setTitleInput('');
                } else {
                    setTitleInput('');
                }
            }
        }
    };

    const removeAltTitle = (title: string) => {
        setAltTitles(altTitles.filter((t: string) => t !== title));
    };

    const handleSubmit = async (e?: React.SyntheticEvent, skipSlugCheck = false) => {
        if (e) e.preventDefault();
        
        if (!data.mal_id) {
            toast.error('Debes vincular un ID de MyAnimeList antes de guardar');
            return;
        }

        let slugToUse = data.slug.trim();
        
        if (!slugToUse) {
            slugToUse = slugify(data.name);
        }

        if (!skipSlugCheck) {
            try {
                const response = await fetch('/admin/animes/check-slug', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                    },
                    body: JSON.stringify({
                        slug: slugToUse,
                        exclude_id: anime.id
                    })
                });
                
                const result = await response.json();
                
                if (!result.available) {
                    setSlugSuggestion(result.suggestion);
                    setShowSlugConfirm(true);
                    return;
                }
            } catch (error) {
                console.error('Error checking slug', error);
            }
        }

        if ((isTmdbChanged || isMalChanged) && !showConfirmDialog) {
            setShowConfirmDialog(true);
            return;
        }

        transform((data: any) => ({
            ...data,
            slug: slugToUse,
        }));

        put(`/admin/animes/${anime.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Anime actualizado correctamente');
                setShowConfirmDialog(false);
                setShowSlugConfirm(false);
            },
        });
    };

    const confirmSlugSuggestion = () => {
        setData('slug', slugSuggestion);
        setShowSlugConfirm(false);
        setTimeout(() => {
            handleSubmit(undefined, true);
        }, 100);
    };

    const searchMal = async () => {
        if (!malSearchQuery.trim()) return;
        setIsSearchingMal(true);
        try {
            const response = await fetch(`/admin/animes/mal-search?query=${encodeURIComponent(malSearchQuery)}`);
            const data = await response.json();
            setMalResults(data.data || []);
        } catch (error) {
            toast.error('Error al buscar en MyAnimeList');
        } finally {
            setIsSearchingMal(false);
        }
    };

    const normalizeRating = (rating: string) => {
        if (!rating) return 'Selecciona una clasificación';
        
        const cleanRating = rating.toLowerCase().trim();
        let result = 'Selecciona una clasificación';
        
        if (cleanRating.includes('pg-13') || cleanRating.includes('pg_13') || cleanRating.includes('teens') || cleanRating.includes('mayores de 13')) {
            result = 'Apto para mayores de 13 años';
        } else if (cleanRating === 'g' || cleanRating.includes('all ages') || cleanRating.includes('todos los públicos')) {
            result = 'Apto para todos los públicos';
        } else if (cleanRating === 'pg' || cleanRating.includes('children') || cleanRating.includes('niños')) {
            result = 'Apto para niños';
        } else if (cleanRating === 'r' || cleanRating.includes('17+') || (cleanRating.includes('mayores de 17') && !cleanRating.includes('restringido'))) {
            result = 'Apto para mayores de 17 años';
        } else if (cleanRating === 'r+' || cleanRating.includes('restringido') || cleanRating.includes('mild nudity')) {
            result = 'Apto para mayores de 17 años (Restringido)';
        } else if (cleanRating === 'rx' || cleanRating.includes('hentai') || cleanRating.includes('adults') || cleanRating.includes('adultos')) {
            result = 'Contenido para adultos';
        }

        return result;
    };

    const selectMalAnime = async (malAnime: any) => {
        const malId = malAnime.node.id;
        setData('mal_id', malId);
        setIsMalSearchOpen(false);
        
        setIsSyncingMal(true);
        const toastId = toast.loading('Sincronizando datos de MyAnimeList...');
        
        try {
            const response = await fetch(`/admin/animes/mal-details/${malId}`);
            if (!response.ok) throw new Error('Error al obtener detalles');
            const result = await response.json();
            
            const mappedRating = normalizeRating(result.rating);
            
            if (result.mappedGenres && result.mappedGenres.length > 0) {
                const combinedGenres = Array.from(new Set([...selectedGenres, ...result.mappedGenres]));
                setSelectedGenres(combinedGenres);
                setData((prev: any) => ({
                    ...prev,
                    ...result,
                    rating: mappedRating,
                    mal_id: malId,
                    genres: combinedGenres.join(','),
                    status: result.status.toString(),
                    broadcast: result.broadcast.toString(),
                }));
            } else {
                setData((prev: any) => ({
                    ...prev,
                    ...result,
                    rating: mappedRating,
                    mal_id: malId,
                    status: result.status.toString(),
                    broadcast: result.broadcast.toString(),
                }));
            }

            if (result.altTitles) {
                const currentNameNormalized = normalizeForComparison(data.name);
                
                const expandedTitles: string[] = [];
                (result.altTitles as string[]).forEach((t: string) => {
                    if (t.includes(',')) {
                        expandedTitles.push(...t.split(',').map(s => s.trim()));
                    } else {
                        expandedTitles.push(t.trim());
                    }
                });

                const newAltTitles = expandedTitles
                    .filter((t: string) => t && normalizeForComparison(t) !== currentNameNormalized);
                
                const uniqueTitles = newAltTitles.filter((item: string, index: number) => 
                    newAltTitles.findIndex((t: string) => normalizeForComparison(t) === normalizeForComparison(item)) === index
                );

                setAltTitles(uniqueTitles);
            }

            toast.success('Datos de MAL cargados en el formulario', { id: toastId });
        } catch (error) {
            toast.error('Error en la sincronización automática', { id: toastId });
        } finally {
            setIsSyncingMal(false);
        }
    };

    const syncWithMal = async () => {
        if (!data.mal_id) {
            toast.error('Vincula primero un ID de MyAnimeList');
            return;
        }

        setIsSyncingMal(true);
        const toastId = toast.loading('Sincronizando con MyAnimeList...');
        
        try {
            const response = await fetch(`/admin/animes/mal-details/${data.mal_id}`);
            if (!response.ok) throw new Error('Error al obtener detalles');
            const result = await response.json();
            
            const mappedRating = normalizeRating(result.rating);
            
            if (result.mappedGenres && result.mappedGenres.length > 0) {
                const combinedGenres = Array.from(new Set([...selectedGenres, ...result.mappedGenres]));
                setSelectedGenres(combinedGenres);
                setData((prev: any) => ({
                    ...prev,
                    ...result,
                    rating: mappedRating,
                    genres: combinedGenres.join(','),
                    status: result.status.toString(),
                    broadcast: result.broadcast.toString(),
                }));
            } else {
                setData((prev: any) => ({
                    ...prev,
                    ...result,
                    rating: mappedRating,
                    status: result.status.toString(),
                    broadcast: result.broadcast.toString(),
                }));
            }

            if (result.altTitles) {
                const currentNameNormalized = normalizeForComparison(data.name);
                
                const expandedTitles: string[] = [];
                (result.altTitles as string[]).forEach((t: string) => {
                    if (t.includes(',')) {
                        expandedTitles.push(...t.split(',').map(s => s.trim()));
                    } else {
                        expandedTitles.push(t.trim());
                    }
                });

                const newAltTitles = expandedTitles
                    .filter((t: string) => t && normalizeForComparison(t) !== currentNameNormalized);
                
                const uniqueTitles = newAltTitles.filter((item: string, index: number) => 
                    newAltTitles.findIndex((t: string) => normalizeForComparison(t) === normalizeForComparison(item)) === index
                );

                setAltTitles(uniqueTitles);
            }

            toast.success('Datos de MAL cargados en el formulario', { id: toastId });
        } catch (error) {
            toast.error('Error al sincronizar con MAL', { id: toastId });
        } finally {
            setIsSyncingMal(false);
        }
    };

    useEffect(() => {
        if (isMalSearchOpen) {
            searchMal();
        }
    }, [isMalSearchOpen]);

    return {
        altTitles,
        titleInput,
        setTitleInput,
        showConfirmDialog,
        setShowConfirmDialog,
        isMalSearchOpen,
        setIsMalSearchOpen,
        malSearchQuery,
        setMalSearchQuery,
        malResults,
        isSearchingMal,
        isSyncingMal,
        selectedGenres,
        toggleGenre,
        handleAddAltTitle,
        removeAltTitle,
        handleSubmit,
        syncWithMal,
        selectMalAnime,
        searchMal,
        isTmdbChanged,
        isMalChanged,
        showSlugConfirm,
        setShowSlugConfirm,
        slugSuggestion,
        confirmSlugSuggestion,
    };
}
