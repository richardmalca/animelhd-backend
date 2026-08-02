import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Anime } from '@/types/anime';
import { AnimeListRow } from './anime-list-row';

interface AnimeTableProps {
    animes: Anime[];
    isSyncing: boolean;
    onSync: (anime: Anime) => void;
    onDelete: (anime: Anime) => void;
    onCopyShortName: (text: string) => void;
}

export function AnimeTable({
    animes,
    isSyncing,
    onSync,
    onDelete,
    onCopyShortName,
}: AnimeTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Anime</TableHead>
                            <TableHead>Nombre Corto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Vistas</TableHead>
                            <TableHead>Estreno</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {animes.map((anime) => (
                            <AnimeListRow
                                key={anime.id}
                                anime={anime}
                                isSyncing={isSyncing}
                                onSync={onSync}
                                onDelete={onDelete}
                                onCopyShortName={onCopyShortName}
                            />
                        ))}
                        {animes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No se encontraron animes registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
