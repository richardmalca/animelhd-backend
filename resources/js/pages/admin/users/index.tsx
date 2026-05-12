import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { User as UserIcon, Mail, Calendar, Crown, Key, Users, CheckCircle, UserPlus } from 'lucide-react';
import { SearchInput } from '@/components/search-input';
import { useUser } from '@/hooks/use-user';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { UserPasswordModal } from '@/components/user-password-modal';
import { UserEmailModal } from '@/components/user-email-modal';

export default function UserIndex({
    users,
    filters,
    stats,
}: {
    users: any;
    filters: any;
    stats: any;
}) {
    const { togglePremium, searchUsers, isProcessing } = useUser();
    const [search, setSearch] = useState(filters.search || '');
    const [isPremium, setIsPremium] = useState(filters.isPremium || 'all');
    
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState<any>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userToPassword, setUserToPassword] = useState<any>(null);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [userToEmail, setUserToEmail] = useState<any>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '') || isPremium !== (filters.isPremium || 'all')) {
                searchUsers({ search, isPremium });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, isPremium]);

    const confirmToggle = (user: any) => {
        setUserToToggle(user);
        setIsToggleModalOpen(true);
    };

    const openPasswordModal = (user: any) => {
        setUserToPassword(user);
        setIsPasswordModalOpen(true);
    };

    const openEmailModal = (user: any) => {
        setUserToEmail(user);
        setIsEmailModalOpen(true);
    };

    const handleToggle = () => {
        if (userToToggle) {
            togglePremium(userToToggle.id);
            setIsToggleModalOpen(false);
        }
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader 
                    title="Usuarios" 
                    subtitle="Visualiza y gestiona los usuarios registrados en la plataforma"
                />

                {/* KPIs */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Totales</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                                <Crown className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Premium</p>
                                <p className="text-2xl font-bold">{stats.premium}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                <CheckCircle className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Verificados</p>
                                <p className="text-2xl font-bold">{stats.verified}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <UserPlus className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Últ. 3 días</p>
                                <p className="text-2xl font-bold">{stats.recent}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                    <SearchInput 
                        placeholder="Buscar por nombre o correo..."
                        value={search}
                        onChange={setSearch}
                    />
                    <Select value={isPremium} onValueChange={setIsPremium}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Tipo de Usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los usuarios</SelectItem>
                            <SelectItem value="1">Usuarios Premium</SelectItem>
                            <SelectItem value="0">Usuarios Normales</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Fecha Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user: any) => (
                                <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        #{user.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                                                <UserIcon className="size-4" />
                                                {user.isPremium && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-background">
                                                        <Crown className="size-2 text-white fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.isPremium ? (
                                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1 border-none">
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
                                                onClick={() => openPasswordModal(user)}
                                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                title="Cambiar Contraseña"
                                            >
                                                <Key className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEmailModal(user)}
                                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                title="Cambiar Correo"
                                            >
                                                <Mail className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => confirmToggle(user)}
                                                className={user.isPremium ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}
                                                title={user.isPremium ? "Quitar Premium" : "Dar Premium"}
                                            >
                                                <Crown className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {users.from || 0} a {users.to || 0} de{' '}
                        {users.total} usuarios
                    </p>
                    <div className="flex gap-1">
                        {users.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                asChild
                                disabled={!link.url}
                                className={!link.url ? 'pointer-events-none opacity-50' : ''}
                            >
                                <Link
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal para Toggle Premium */}
            <ConfirmDialog
                open={isToggleModalOpen}
                onOpenChange={setIsToggleModalOpen}
                onConfirm={handleToggle}
                title={userToToggle?.name}
                description={
                    userToToggle?.isPremium 
                    ? `¿Estás seguro de que deseas desactivar el acceso Premium para ${userToToggle?.name}?`
                    : `¿Estás seguro de que deseas activar el acceso Premium para ${userToToggle?.name}?`
                }
                confirmText={userToToggle?.isPremium ? "Desactivar Premium" : "Activar Premium"}
                confirmVariant={userToToggle?.isPremium ? "destructive" : "default"}
                processing={isProcessing}
            />

            {/* Modal para Cambiar Contraseña */}
            <UserPasswordModal 
                open={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                user={userToPassword}
            />

            <UserEmailModal
                open={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                user={userToEmail}
            />
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Usuarios', href: '#' },
    ],
};
