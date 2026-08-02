import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import { EpisodeIndexActions } from './components/episode-index-actions';
import { EpisodeModal } from './components/episode-modal';
import { EpisodeTable } from './components/episode-table';
import { useEpisodeIndex } from './hooks/use-episode-index';

export default function EpisodeIndex({
    episodes,
    animes,
    anime,
    next_episode_number = '1',
}: {
    episodes: any;
    animes: any;
    anime?: any;
    next_episode_number?: string | number;
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
        isDirty,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteEpisode,
    } = useEpisodeIndex(anime?.id?.toString(), next_episode_number);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title={anime ? `Episodios: ${anime.name}` : 'Gestión de Episodios'} />

            <PageHeader
                title={
                    <span className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <span>Episodios</span>
                            <Badge variant="secondary">{episodes.total} episodios</Badge>
                        </span>
                        {anime && (
                            <span className="max-w-sm text-base font-normal text-muted-foreground line-clamp-2 md:hidden">
                                {anime.name}
                            </span>
                        )}
                    </span>
                }
                subtitle={anime ? anime.name : 'Administra los capítulos de todas las series'}
            >
                <div className="flex items-center gap-2">
                    <EpisodeIndexActions
                        animeId={anime?.id}
                        onCreate={openCreateModal}
                    />
                </div>
            </PageHeader>

            <EpisodeTable
                episodes={episodes}
                animeId={anime?.id}
                showAnimeName={!anime}
                onEdit={openEditModal}
                onDelete={confirmDelete}
            />

            <Pagination
                links={episodes.links}
                from={episodes.from}
                to={episodes.to}
                total={episodes.total}
                label="episodios"
            />

            <EpisodeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                submit={submit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingEpisode={editingEpisode}
                isDirty={isDirty}
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
