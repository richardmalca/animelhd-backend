import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[80px] font-black uppercase tracking-widest text-[10px]">ID</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Anime</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Nombre Corto</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Tipo</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Estado</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Vistas</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Estreno</TableHead>
                        <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Acciones</TableHead>
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
        </div>
    );
}
