import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { useGenre } from '@/hooks/use-genre';
import AppLayout from '@/layouts/app-layout';
import { GenreModal } from './components/genre-modal';
import { GenreTable } from './components/genre-table';

export default function GenreIndex({
    genres,
    filters,
}: {
    genres: any;
    filters: any;
}) {
    const {
        data,
        setData,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingGenre,
        genreToDelete,
        search,
        setSearch,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteGenre,
    } = useGenre(filters);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title="Gestión de Géneros" />

            <PageHeader 
                title="Géneros" 
                subtitle="Administra las categorías de animes"
            >
                <Button onClick={openCreateModal}>
                    <Plus className="size-4" />
                    <span>Nuevo Género</span>
                </Button>
            </PageHeader>

            <div className="flex items-center gap-4">
                <SearchInput 
                    placeholder="Buscar géneros..."
                    value={search}
                    onChange={setSearch}
                />
            </div>

            <GenreTable
                genres={genres.data}
                onEdit={openEditModal}
                onDelete={confirmDelete}
            />

            <Pagination
                links={genres.links}
                from={genres.from}
                to={genres.to}
                total={genres.total}
                label="géneros"
            />

            <GenreModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                submit={submit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingGenre={editingGenre}
            />

            <ConfirmDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={deleteGenre}
                title={genreToDelete?.title}
                type="género"
                processing={processing}
            />
        </div>
    );
}

GenreIndex.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Administración', href: '/admin' },
            { title: 'Géneros', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
