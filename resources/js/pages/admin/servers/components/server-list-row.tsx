import { Edit, Trash2, Server as ServerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ServerListRowProps {
    server: any;
    onEdit: (server: any) => void;
    onDelete: (server: any) => void;
}

export function ServerListRow({
    server,
    onEdit,
    onDelete,
}: ServerListRowProps) {
    return (
        <TableRow className="transition-colors hover:bg-muted/30">
            <TableCell className="font-mono text-xs text-muted-foreground">
                #{server.id}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                        <ServerIcon className="size-4" />
                    </div>
                    <span className="font-medium">
                        {server.title}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground font-mono">
                    {server.embed}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(server.domains) && server.domains.length > 0 ? (
                        server.domains.map((domain: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="font-mono text-[10px]">
                                {domain}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                    {server.show_on_web_desktop && <Badge variant="outline" className="text-[10px]">PC</Badge>}
                    {server.show_on_web_mobile && <Badge variant="outline" className="text-[10px]">Móvil</Badge>}
                    {server.show_on_app && <Badge variant="outline" className="text-[10px]">App</Badge>}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(server)}
                    >
                        <Edit className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(server)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
