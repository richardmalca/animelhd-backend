import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ServerListRow } from './server-list-row';

interface ServerTableProps {
    servers: any[];
    onEdit: (server: any) => void;
    onDelete: (server: any) => void;
}

export function ServerTable({ servers, onEdit, onDelete }: ServerTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[200px]">Título</TableHead>
                            <TableHead>Embed URL</TableHead>
                            <TableHead>Dominios Permitidos</TableHead>
                            <TableHead className="text-center">Visibilidad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servers.map((server: any) => (
                            <ServerListRow
                                key={server.id}
                                server={server}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {servers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No se encontraron servidores.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
