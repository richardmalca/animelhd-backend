import { Edit, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { PlayerGroupRow } from '../language';
import { playerEmbedUrl } from '../player-url';

interface PlayerTableProps {
    rows: PlayerGroupRow[];
    onEdit: (player: any) => void;
    onDelete: (player: any) => void;
    onAdd: (serverId: number) => void;
}

export function PlayerTable({ rows, onEdit, onDelete, onAdd }: PlayerTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Enlace</TableHead>
                    <TableHead>Agregado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(({ server, player }) => (
                    <TableRow key={server.id} className={player ? undefined : 'opacity-60'}>
                        <TableCell>
                            <Badge variant="outline" className="font-medium">
                                {server.title}
                            </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                            {player ? (
                                <a
                                    href={playerEmbedUrl(player)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={playerEmbedUrl(player)}
                                    className="block truncate font-mono text-xs text-muted-foreground hover:text-primary hover:underline"
                                >
                                    {playerEmbedUrl(player)}
                                </a>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {player ? formatDate(player.created_at) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                            {player ? (
                                <div className="flex items-center justify-end gap-1">
                                    <Button variant="secondary" size="icon" onClick={() => onEdit(player)}>
                                        <Edit />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDelete(player)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => onAdd(server.id)}>
                                        <Plus />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
