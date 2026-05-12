import { Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface GenreListRowProps {
    genre: any;
    onEdit: (genre: any) => void;
    onDelete: (genre: any) => void;
}

export function GenreListRow({
    genre,
    onEdit,
    onDelete,
}: GenreListRowProps) {
    return (
        <TableRow className="transition-colors hover:bg-muted/30">
            <TableCell className="font-mono text-xs text-muted-foreground">
                #{genre.id}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Tag className="size-4" />
                    </div>
                    <span className="font-medium">
                        {genre.title}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className="font-normal">
                    {genre.slug}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {genre.name_mal || '-'}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(genre)}
                    >
                        <Edit className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(genre)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
