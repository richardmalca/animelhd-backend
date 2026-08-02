import { Link } from '@inertiajs/react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpisodeIndexActionsProps {
    animeId?: number;
    onCreate: () => void;
}

export function EpisodeIndexActions({ animeId, onCreate }: EpisodeIndexActionsProps) {
    return (
        <>
            {animeId && (
                <Button variant="outline" asChild>
                    <Link href={`/admin/animes/${animeId}/episodes/import`}>
                        <Layers />
                        <span>Importador</span>
                    </Link>
                </Button>
            )}
            <Button onClick={onCreate}>
                <Plus />
                <span>Nuevo Episodio</span>
            </Button>
        </>
    );
}
