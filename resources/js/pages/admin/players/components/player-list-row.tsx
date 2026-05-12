import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PlayerListRowProps {
    player: any;
    onEdit: (player: any) => void;
    onDelete: (player: any) => void;
}

export function PlayerListRow({
    player,
    onEdit,
    onDelete,
}: PlayerListRowProps) {
    return (
        <TableRow className="group transition-colors hover:bg-muted/5">
            <TableCell className="font-mono text-xs text-muted-foreground">
                #{player.id}
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="font-medium">
                    {player.server?.title || 'Unknown'}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge 
                    variant={
                        player.languaje === '0' || player.languaje === 0 ? 'default' : 
                        player.languaje === '1' || player.languaje === 1 ? 'secondary' : 'outline'
                    }
                    className="font-bold"
                >
                    {
                        player.languaje === '0' || player.languaje === 0 ? 'Subtitulado' : 
                        player.languaje === '1' || player.languaje === 1 ? 'Latino' : 'Castellano'
                    }
                </Badge>
            </TableCell>
            <TableCell className="max-w-[250px]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate font-mono bg-muted/30 px-2 py-1 rounded">
                    {player.code}
                </div>
            </TableCell>
            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(player.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </TableCell>
            <TableCell className="px-6 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(player)}
                    >
                        <Edit className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(player)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
