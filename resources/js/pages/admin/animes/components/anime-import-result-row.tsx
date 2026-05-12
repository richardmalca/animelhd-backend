import { Star, Tv, Plus, Loader2, Check } from 'lucide-react';
import { AnimeTypeBadge } from '@/components/anime/anime-type-badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

interface AnimeImportResultRowProps {
    item: any;
    importingId: number | null;
    isImported: (id: number) => boolean;
    onImport: (tmdbId: number, mediaType: string, name: string, exists: boolean) => void;
}

export function AnimeImportResultRow({
    item,
    importingId,
    isImported,
    onImport,
}: AnimeImportResultRowProps) {
    const imported = isImported(item.id);
    const loading = importingId === item.id;

    return (
        <TableRow>
            <TableCell>
                <div className="h-12 w-8 overflow-hidden rounded bg-muted">
                    {item.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt={item.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Tv className="h-4 w-4 opacity-20" />
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex max-w-[300px] flex-col">
                    <span className="truncate text-sm font-medium">{item.name || item.title}</span>
                    <span className="truncate text-[10px] text-muted-foreground">
                        {item.original_name || item.original_title}
                    </span>
                    {item.exists && (
                        <span className="mt-0.5 text-[10px] font-medium text-green-500">Ya en tu catálogo</span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <AnimeTypeBadge type={item.media_type === 'tv' ? 'TV' : 'MOVIE'} />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
                {item.first_air_date
                    ? new Date(item.first_air_date).getFullYear()
                    : item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : 'N/A'}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-medium">{item.vote_average?.toFixed(1) || '0.0'}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    size="sm"
                    variant={imported ? 'outline' : item.exists ? 'ghost' : 'default'}
                    className={`h-8 gap-2 ${imported ? 'border-primary/20 bg-primary/5 text-primary' : ''}`}
                    disabled={loading || imported}
                    onClick={() =>
                        onImport(
                            item.id,
                            item.media_type || 'tv',
                            item.name || item.title,
                            item.exists,
                        )
                    }
                >
                    {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : imported ? (
                        <Check className="h-3 w-3" />
                    ) : (
                        <Plus className="h-3 w-3" />
                    )}
                    <span className="text-xs">
                        {imported ? 'Importado' : item.exists ? 'Re-importar' : 'Importar'}
                    </span>
                </Button>
            </TableCell>
        </TableRow>
    );
}
