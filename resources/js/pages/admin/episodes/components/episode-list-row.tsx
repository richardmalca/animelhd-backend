import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';

interface EpisodeListRowProps {
    episode: any;
    animeId?: number;
    showAnimeName?: boolean;
    onEdit: (episode: any) => void;
    onDelete: (episode: any) => void;
}

export function EpisodeListRow({
    episode,
    animeId,
    showAnimeName,
    onEdit,
    onDelete,
}: EpisodeListRowProps) {
    return (
        <TableRow
            className="group cursor-pointer transition-colors hover:bg-muted/5"
            onClick={() =>
                router.visit(
                    `/admin/animes/${animeId || episode.anime_id}/episodes/${episode.id}/players`,
                )
            }
        >
            <TableCell className="font-mono text-xs text-muted-foreground">
                #{episode.id}
            </TableCell>
            {showAnimeName && (
                <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                            {episode.anime?.name || 'N/A'}
                        </span>
                    </div>
                </TableCell>
            )}
            <TableCell>
                <span className="font-bold transition-colors group-hover:text-primary text-sm">
                    Episodio {episode.number}
                </span>
            </TableCell>
            <TableCell>
                <span className="text-xs font-medium">
                    {episode.views?.toLocaleString() || 0}
                </span>
            </TableCell>
            <TableCell>
                <span className="text-xs font-medium">
                    {episode.views_app?.toLocaleString() || 0}
                </span>
            </TableCell>
            <TableCell>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(episode.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                </span>
            </TableCell>
            <TableCell className="px-6 text-right">
                <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(episode)}
                    >
                        <Edit className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(episode)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
