import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

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
                <span className="font-medium">
                    {genre.title}
                </span>
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
                    <Button variant="secondary" size="icon" onClick={() => onEdit(genre)}>
                        <Edit />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => onDelete(genre)}>
                        <Trash2 />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
