import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useAnimeImport(hasApiKey: boolean) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [importingId, setImportingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingImport, setPendingImport] = useState<{
        id: number;
        type: string;
        name: string;
    } | null>(null);
    const [importedIds, setImportedIds] = useState<number[]>([]);

    const handleImport = (
        tmdbId: number,
        mediaType: string,
        name: string,
        exists: boolean,
    ) => {
        if (exists) {
            setPendingImport({ id: tmdbId, type: mediaType, name });
            setShowConfirm(true);
            return;
        }
        executeImport(tmdbId, mediaType);
    };

    const executeImport = (tmdbId: number, mediaType: string) => {
        setImportingId(tmdbId);
        setShowConfirm(false);

        router.post(
            '/admin/animes/import',
            {
                tmdb_id: tmdbId,
                media_type: mediaType,
            },
            {
                onSuccess: () => {
                    toast.success('Anime importado correctamente');
                    setImportedIds(prev => [...prev, tmdbId]);
                },
                onError: (errors: any) => {
                    toast.error(errors.error || 'Error al importar el anime');
                },
                onFinish: () => {
                    setImportingId(null);
                    setPendingImport(null);
                },
            },
        );
    };

    const handleSearch = async (signal: AbortSignal) => {
        if (!hasApiKey || query.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `/admin/animes/tmdb-search?query=${encodeURIComponent(query)}`,
                { signal }
            );
            const data = await response.json();

            if (data.results) {
                setResults(data.results);
            } else if (data.error) {
                toast.error(data.error);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            toast.error('Error al conectar con TMDB');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (value.length >= 2) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setResults([]);
        }
    };

    useEffect(() => {
        if (!query || query.length < 2) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            handleSearch(controller.signal);
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    return {
        query,
        setQuery: handleQueryChange,
        results,
        loading,
        isSearching,
        importingId,
        showConfirm,
        setShowConfirm,
        pendingImport,
        importedIds,
        handleImport,
        executeImport,
    };
}
