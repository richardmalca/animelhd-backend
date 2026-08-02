import { Link } from '@inertiajs/react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimeIndexActionsProps {
    isSyncingAll: boolean;
    onSyncAll: () => void;
}

export function AnimeIndexActions({ isSyncingAll, onSyncAll }: AnimeIndexActionsProps) {
    return (
        <>
            <Button
                onClick={onSyncAll}
                variant="secondary"
                disabled={isSyncingAll}
            >
                <RefreshCw className={isSyncingAll ? 'animate-spin' : undefined} />
                <span>Sincronizar Todo</span>
            </Button>
            <Button asChild>
                <Link href="/admin/animes/import">
                    <Plus />
                    <span>Importar TMDB</span>
                </Link>
            </Button>
        </>
    );
}
