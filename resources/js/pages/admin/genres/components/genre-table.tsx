import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { GenreListRow } from './genre-list-row';

interface GenreTableProps {
    genres: any[];
    onEdit: (genre: any) => void;
    onDelete: (genre: any) => void;
}

export function GenreTable({ genres, onEdit, onDelete }: GenreTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[300px]">Título</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Referencia MAL</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {genres.map((genre: any) => (
                            <GenreListRow
                                key={genre.id}
                                genre={genre}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {genres.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No se encontraron géneros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
