import { useState } from 'react';
import { toast } from 'sonner';
import { slugify } from '../utils';

type Anime = { id: number; tmdb_id: number | null; mal_id: number | null };

type UseAnimeSubmitArgs = {
    anime: Anime;
    data: { name: string; slug: string; mal_id: string | number; tmdb_id: string | number };
    setData: (key: string, value: unknown) => void;
    transform: (callback: (data: Record<string, unknown>) => Record<string, unknown>) => void;
    put: (url: string, options?: Record<string, unknown>) => void;
};

export function useAnimeSubmit({ anime, data, setData, transform, put }: UseAnimeSubmitArgs) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSlugConfirm, setShowSlugConfirm] = useState(false);
    const [slugSuggestion, setSlugSuggestion] = useState('');

    const isTmdbChanged = Boolean(anime.tmdb_id) && data.tmdb_id.toString() !== anime.tmdb_id?.toString();
    const isMalChanged = Boolean(anime.mal_id) && data.mal_id.toString() !== anime.mal_id?.toString();

    const checkSlugAvailability = async (slug: string) => {
        const response = await fetch('/admin/animes/check-slug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ slug, exclude_id: anime.id }),
        });

        return (await response.json()) as { available: boolean; suggestion?: string };
    };

    const submit = () => {
        put(`/admin/animes/${anime.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Anime actualizado correctamente');
                setShowConfirmDialog(false);
                setShowSlugConfirm(false);
            },
        });
    };

    const handleSubmit = async (e?: React.SyntheticEvent, skipSlugCheck = false) => {
        e?.preventDefault();

        if (!data.mal_id) {
            toast.error('Debes vincular un ID de MyAnimeList antes de guardar');
            return;
        }

        const slugToUse = data.slug.trim() || slugify(data.name);

        if (!skipSlugCheck) {
            try {
                const result = await checkSlugAvailability(slugToUse);
                if (!result.available && result.suggestion) {
                    setSlugSuggestion(result.suggestion);
                    setShowSlugConfirm(true);
                    return;
                }
            } catch {
                // If the availability check fails, fall through and let the server validate on submit.
            }
        }

        if ((isTmdbChanged || isMalChanged) && !showConfirmDialog) {
            setShowConfirmDialog(true);
            return;
        }

        transform((prev) => ({ ...prev, slug: slugToUse }));
        submit();
    };

    const confirmSlugSuggestion = () => {
        setData('slug', slugSuggestion);
        setShowSlugConfirm(false);
        setTimeout(() => handleSubmit(undefined, true), 100);
    };

    return {
        handleSubmit,
        isTmdbChanged,
        isMalChanged,
        showConfirmDialog,
        setShowConfirmDialog,
        showSlugConfirm,
        setShowSlugConfirm,
        slugSuggestion,
        confirmSlugSuggestion,
    };
}
