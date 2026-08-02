import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EpisodeListRow } from './episode-list-row';

interface EpisodeTableProps {
    episodes: any;
    animeId?: number;
    showAnimeName?: boolean;
    onEdit: (episode: any) => void;
    onDelete: (episode: any) => void;
}

export function EpisodeTable({
    episodes,
    animeId,
    showAnimeName,
    onEdit,
    onDelete,
}: EpisodeTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            {showAnimeName && <TableHead>Anime</TableHead>}
                            <TableHead>Episodio</TableHead>
                            <TableHead className="hidden md:table-cell">Vistas Web</TableHead>
                            <TableHead className="hidden md:table-cell">Vistas App</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {episodes.data.map((episode: any) => (
                            <EpisodeListRow
                                key={episode.id}
                                episode={episode}
                                animeId={animeId}
                                showAnimeName={showAnimeName}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {episodes.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={showAnimeName ? 7 : 6} className="h-24 text-center text-muted-foreground">
                                    No se han encontrado episodios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
