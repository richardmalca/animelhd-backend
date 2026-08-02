import { Edit, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { PlayerGroupRow } from '../language';
import { playerEmbedUrl } from '../player-url';
import { PlayerTable } from './player-table';

interface PlayerGroupProps {
    label: string;
    rows: PlayerGroupRow[];
    onEdit: (player: any) => void;
    onDelete: (player: any) => void;
    onAdd: (serverId: number) => void;
}

export function PlayerGroup({ label, rows, onEdit, onDelete, onAdd }: PlayerGroupProps) {
    const count = rows.filter((row) => row.player).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {label}
                    <Badge variant="secondary">{count}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y md:hidden">
                {rows.map(({ server, player }) => (
                    <div key={server.id} className={player ? 'flex flex-col gap-1 py-3' : 'flex items-center gap-3 py-3 opacity-60'}>
                        {player ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={playerEmbedUrl(player)}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={playerEmbedUrl(player)}
                                        className="flex-1 truncate font-mono text-[10px] text-muted-foreground hover:text-primary hover:underline"
                                    >
                                        {playerEmbedUrl(player)}
                                    </a>
                                    <Button variant="secondary" size="icon" onClick={() => onEdit(player)}>
                                        <Edit />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDelete(player)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-medium">
                                        {server.title}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(player.created_at)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Badge variant="outline" className="shrink-0 font-medium">
                                    {server.title}
                                </Badge>
                                <span className="flex-1 text-xs text-muted-foreground">Sin reproductor</span>
                                <Button variant="ghost" size="icon" onClick={() => onAdd(server.id)}>
                                    <Plus />
                                </Button>
                            </>
                        )}
                    </div>
                ))}
            </CardContent>
            <div className="hidden md:block">
                <PlayerTable rows={rows} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
            </div>
        </Card>
    );
}
