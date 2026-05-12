import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/search-input';
import { useServer } from '@/hooks/use-server';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ServerCreateModal } from './server-create-modal';
import { ServerEditModal } from './server-edit-modal';
import AppLayout from '@/layouts/app-layout';
import { ServerListRow } from './components/server-list-row';

export default function ServerIndex({
    servers,
    filters,
}: {
    servers: any;
    filters: any;
}) {
    const {
        data,
        setData,
        processing,
        errors,
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        serverToDelete,
        search,
        setSearch,
        openCreateModal,
        openEditModal,
        closeCreateModal,
        closeEditModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submitCreate,
        submitEdit,
        deleteServer,
    } = useServer(filters);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title="Gestión de Servidores" />

            <PageHeader 
                title="Servidores" 
                subtitle="Administra los servidores de video y embeds"
            >
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="size-4" />
                    <span>Nuevo Servidor</span>
                </Button>
            </PageHeader>

            <div className="flex items-center gap-4">
                <SearchInput 
                    placeholder="Buscar por título o embed..."
                    value={search}
                    onChange={setSearch}
                />
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[200px]">Título</TableHead>
                            <TableHead>Embed URL</TableHead>
                            <TableHead>Dominios Permitidos</TableHead>
                            <TableHead className="text-center">Visibilidad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servers.data.map((server: any) => (
                            <ServerListRow 
                                key={server.id}
                                server={server}
                                onEdit={openEditModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                        {servers.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No se encontraron servidores.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                    Mostrando {servers.from || 0} a {servers.to || 0} de {servers.total} servidores
                </p>
                <div className="flex gap-1">
                    {servers.links.map((link: any, index: number) => (
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

            <ServerCreateModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                submit={submitCreate}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
            />

            <ServerEditModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                submit={submitEdit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
            />

            <ConfirmDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={deleteServer}
                title={serverToDelete?.title}
                type="servidor"
                processing={processing}
            />
        </div>
    );
}

ServerIndex.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Administración', href: '/admin' },
            { title: 'Servidores', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
