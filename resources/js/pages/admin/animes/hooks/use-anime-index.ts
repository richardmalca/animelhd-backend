import { toast } from 'sonner';
import { useAnime } from '@/hooks/use-anime';
import { useAnimeFilters } from '@/hooks/use-anime-filters';
import { useClipboard } from '@/hooks/use-clipboard';
import type { AnimeFilters } from '@/types/anime';
import { useSyncAllProgress } from './use-sync-all-progress';


export function useAnimeIndex(filters: AnimeFilters) {
    const { search, setSearch, status, setStatus, type, setType } = useAnimeFilters(filters);
    const [, copy] = useClipboard();

    const syncAll = useSyncAllProgress();

    const {
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        animeToDelete,
        isDeleting,
        isSyncing,
        confirmDelete,
        deleteAnime,
        handleSync,
    } = useAnime();

    const handleCopyShortName = (text: string) => {
        copy(text).then((success) => {
            if (success) {
                toast.success(`Nombre corto "${text}" copiado al portapapeles`);
            }
        });
    };

    return {
        filters: { search, setSearch, status, setStatus, type, setType },
        modals: {
            isDeleteModalOpen,
            setIsDeleteModalOpen,
            animeToDelete,
            isDeleting,
            confirmDelete,
            deleteAnime,
        },
        actions: {
            handleSync,
            handleCopyShortName,
            isSyncing,
        },
        syncAll,
    };
}
