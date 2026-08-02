import { Link, router } from '@inertiajs/react';
import { Edit, RefreshCw, Trash2 } from 'lucide-react';
import { AnimeStatusBadge } from '@/components/anime/anime-status-badge';
import { AnimeTypeBadge } from '@/components/anime/anime-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCompactNumber, formatDate } from '@/lib/utils';
import type { Anime } from '@/types/anime';

interface AnimeListRowProps {
    anime: Anime;
    isSyncing: boolean;
    onSync: (anime: Anime) => void;
    onDelete: (anime: Anime) => void;
    onCopyShortName: (text: string) => void;
}

export function AnimeListRow({
    anime,
    isSyncing,
    onSync,
    onDelete,
    onCopyShortName,
}: AnimeListRowProps) {
    return (
        <TableRow
            className="cursor-pointer group"
            onClick={() => router.visit(`/admin/animes/${anime.id}/episodes`)}
        >
            <TableCell className="font-mono text-muted-foreground">
                #{anime.id}
            </TableCell>
            <TableCell className="max-w-[300px]">
                <div className="flex flex-col">
                    <span
                        className="truncate font-medium group-hover:text-primary"
                        title={anime.name}
                    >
                        {anime.name}
                    </span>
                    {anime.name_alternative && (
                        <span
                            className="truncate text-muted-foreground"
                            title={anime.name_alternative}
                        >
                            {anime.name_alternative}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                {anime.short_name && (
                    <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyShortName(anime.short_name as string);
                        }}
                    >
                        {anime.short_name}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <AnimeTypeBadge type={anime.type} />
            </TableCell>
            <TableCell>
                <AnimeStatusBadge status={anime.status} />
            </TableCell>
            <TableCell>
                {formatCompactNumber(anime.views)}
            </TableCell>
            <TableCell>
                {formatDate(anime.aired)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSync(anime)}
                        disabled={!anime.mal_id || isSyncing}
                    >
                        <RefreshCw className={isSyncing ? 'animate-spin' : undefined} />
                    </Button>
                    <Button variant="secondary" size="icon" asChild>
                        <Link href={`/admin/animes/${anime.id}/edit`}>
                            <Edit />
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(anime)}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
