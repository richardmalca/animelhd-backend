import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Anime } from '@/types/anime';


export function useAnime() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [animeToDelete, setAnimeToDelete] = useState<Anime | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const confirmDelete = (anime: Anime) => {
        setAnimeToDelete(anime);
        setIsDeleteModalOpen(true);
    };

    const deleteAnime = () => {
        if (!animeToDelete) {
return;
}

        setIsDeleting(true);

        router.delete(`/admin/animes/${animeToDelete.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setAnimeToDelete(null);
                toast.success('Anime eliminado correctamente');
            },
            onError: (errors) => {
                toast.error(errors.error || 'No se pudo eliminar el anime');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleSync = (anime: Anime) => {
        if (!anime.mal_id) {
            toast.error('Este anime no tiene un ID de MyAnimeList vinculado');

            return;
        }

        setIsSyncing(true);
        router.post(`/admin/animes/mal-sync/${anime.id}`, {}, {
            onSuccess: () => {
                toast.success('Datos sincronizados con MyAnimeList');
            },
            onError: (errors: any) => {
                toast.error(errors.error || 'Error al sincronizar con MAL');
            },
            onFinish: () => setIsSyncing(false)
        });
    };

    return {
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        animeToDelete,
        isDeleting,
        isSyncing,
        confirmDelete,
        deleteAnime,
        handleSync,
    };
}

