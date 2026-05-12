import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Plus, RefreshCw } from 'lucide-react';
import { SearchInput } from '@/components/search-input';
import { useGenre } from '@/hooks/use-genre';
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
import AppLayout from '@/layouts/app-layout';
import { GenreListRow } from './components/genre-list-row';
import { GenreModal } from './components/genre-modal';

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
        syncWithMal,
    } = useGenre(filters);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title="Gestión de Géneros" />

            <PageHeader 
                title="Géneros" 
                subtitle="Administra las categorías de animes"
            >
                <Button variant="outline" onClick={syncWithMal}>
                    <RefreshCw className="size-4 mr-2" />
                    <span>Sincronizar con MAL</span>
                </Button>
                <Button onClick={openCreateModal}>
                    <Plus className="size-4 mr-2" />
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

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[300px]">Título</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Referencia MAL</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {genres.data.map((genre: any) => (
                            <GenreListRow 
                                key={genre.id}
                                genre={genre}
                                onEdit={openEditModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                        {genres.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No se encontraron géneros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                    Mostrando {genres.from || 0} a {genres.to || 0} de {genres.total} géneros
                </p>
                <div className="flex gap-1">
                    {genres.links.map((link: any, index: number) => (
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
