import { Edit, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCompactNumber, formatDate } from '@/lib/utils';

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
            className="cursor-pointer group"
            onClick={() =>
                router.visit(
                    `/admin/animes/${animeId || episode.anime_id}/episodes/${episode.id}/players`,
                )
            }
        >
            <TableCell className="font-mono text-muted-foreground">
                #{episode.id}
            </TableCell>
            {showAnimeName && (
                <TableCell>
                    <span className="font-medium">
                        {episode.anime?.name || 'N/A'}
                    </span>
                </TableCell>
            )}
            <TableCell>
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium group-hover:text-primary">
                        Episodio {episode.number}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground md:hidden">
                        <Monitor className="size-3" />
                        {formatCompactNumber(episode.views)}
                        <span className="text-muted-foreground/50">·</span>
                        <Smartphone className="size-3" />
                        {formatCompactNumber(episode.views_app)}
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {formatCompactNumber(episode.views)}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {formatCompactNumber(episode.views_app)}
            </TableCell>
            <TableCell>
                {formatDate(episode.created_at)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="icon" onClick={() => onEdit(episode)}>
                        <Edit />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => onDelete(episode)}>
                        <Trash2 />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
