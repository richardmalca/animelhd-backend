import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Plus, Layers, ArrowLeft } from 'lucide-react';
import { EpisodeModal } from './episode-modal';
import { useEpisode } from '@/hooks/use-episode';
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
import { EpisodeListRow } from './components/episode-list-row';

export default function EpisodeIndex({
    episodes,
    animes,
    anime,
}: {
    episodes: any;
    animes: any;
    anime?: any;
}) {
    const {
        data,
        setData,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingEpisode,
        episodeToDelete,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteEpisode,
    } = useEpisode(anime?.id?.toString());

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title={anime ? `Episodios: ${anime.name}` : 'Gestión de Episodios'} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        {anime && (
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                <Link href="/admin/animes">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        )}
                        <div className="flex items-center gap-2">
                            <Layers className="size-6 text-muted-foreground" />
                            {anime ? `Episodios de ${anime.name}` : 'Episodios'}
                        </div>
                    </div>
                }
                subtitle={anime ? `Gestionando capítulos de la serie` : 'Administra los capítulos de todas las series'}
            >
                <div className="flex gap-2">
                    {anime && (
                        <Button variant="outline" asChild className="gap-2">
                            <Link href={`/admin/animes/${anime.id}/episodes/import`}>
                                <Layers className="size-4" />
                                <span>Importador</span>
                            </Link>
                        </Button>
                    )}
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="size-4" />
                        <span>Nuevo Episodio</span>
                    </Button>
                </div>
            </PageHeader>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">ID</TableHead>
                            {!anime && <TableHead>Anime</TableHead>}
                            <TableHead>Episodio</TableHead>
                            <TableHead>Vistas Web</TableHead>
                            <TableHead>Vistas App</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="px-6 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {episodes.data.map((episode: any) => (
                            <EpisodeListRow 
                                key={episode.id}
                                episode={episode}
                                animeId={anime?.id}
                                showAnimeName={!anime}
                                onEdit={openEditModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                        {episodes.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={anime ? 6 : 7} className="h-32 text-center text-muted-foreground">
                                    No se han encontrado episodios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                    Mostrando {episodes.from} a {episodes.to} de {episodes.total} episodios
                </p>
                <div className="flex gap-1">
                    {episodes.links.map((link: any, index: number) => (
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

            <EpisodeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                submit={submit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingEpisode={editingEpisode}
                anime={anime}
                animes={animes}
            />

            <ConfirmDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={deleteEpisode}
                title={`Episodio ${episodeToDelete?.number}`}
                type="episodio"
                processing={processing}
            />
        </div>
    );
}

EpisodeIndex.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Administración', href: '/admin' },
            { title: 'Animes', href: '/admin/animes' },
            ...(page.props?.anime
                ? [
                      { title: page.props?.anime?.name, href: '#' },
                      { title: 'Episodios', href: '#' },
                  ]
                : [{ title: 'Episodios', href: '#' }]),
        ]}
    >
        {page}
    </AppLayout>
);
