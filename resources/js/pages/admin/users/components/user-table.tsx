import { Calendar, Crown, Key, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface UserTableProps {
    users: any[];
    onOpenPassword: (user: any) => void;
    onOpenEmail: (user: any) => void;
    onToggle: (user: any) => void;
}

export function UserTable({ users, onOpenPassword, onOpenEmail, onToggle }: UserTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Fecha Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{user.id}
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">{user.name}</span>
                                </TableCell>
                                <TableCell>
                                    {user.isPremium ? (
                                        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700 text-white gap-1 border-none">
                                            <Crown className="size-3 fill-current" />
                                            Premium
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="opacity-70">
                                            Normal
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="size-3" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="size-3" />
                                        <span className="text-xs">{formatDate(user.created_at)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onOpenPassword(user)}
                                            title="Cambiar Contraseña"
                                        >
                                            <Key />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onOpenEmail(user)}
                                            title="Cambiar Correo"
                                        >
                                            <Mail />
                                        </Button>
                                        <Button
                                            variant={user.isPremium ? 'destructive' : 'secondary'}
                                            size="icon"
                                            onClick={() => onToggle(user)}
                                            title={user.isPremium ? 'Quitar Premium' : 'Dar Premium'}
                                        >
                                            <Crown />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
