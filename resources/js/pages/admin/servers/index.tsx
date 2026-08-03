import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { useServer } from '@/hooks/use-server';
import AppLayout from '@/layouts/app-layout';
import { ServerTable } from './components/server-table';
import { ServerCreateModal } from './server-create-modal';
import { ServerEditModal } from './server-edit-modal';

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
                <Button onClick={openCreateModal}>
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

            <ServerTable
                servers={servers.data}
                onEdit={openEditModal}
                onDelete={confirmDelete}
            />

            <Pagination
                links={servers.links}
                from={servers.from}
                to={servers.to}
                total={servers.total}
                label="servidores"
            />

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
