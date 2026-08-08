import { Head } from '@inertiajs/react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import type { Anime, AnimeFilters, PaginatedData } from '@/types/anime';
import { AnimeFiltersSection } from './components/anime-filters-section';
import { AnimeIndexActions } from './components/anime-index-actions';
import { AnimeTable } from './components/anime-table';
import { SyncAllProgressModal } from './components/sync-all-progress-modal';
import { useAnimeIndex } from './hooks/use-anime-index';

export default function AnimeIndex({
    animes,
    filters: initialFilters,
}: {
    animes: PaginatedData<Anime>;
    filters: AnimeFilters;
}) {
    const { filters, modals, actions, syncAll } = useAnimeIndex(initialFilters);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title="Listado de Animes" />

            <PageHeader
                title="Animes"
                subtitle="Gestiona el catálogo completo de series y películas"
            >
                <div className="flex items-center gap-2">
                    <AnimeIndexActions
                        isSyncingAll={syncAll.isModalOpen || syncAll.isLaunching}
                        onSyncAll={syncAll.openConfirm}
                    />
                </div>
            </PageHeader>

            <AnimeFiltersSection
                search={filters.search}
                setSearch={filters.setSearch}
                type={filters.type}
                setType={filters.setType}
                status={filters.status}
                setStatus={filters.setStatus}
            />

            <AnimeTable
                animes={animes.data}
                isSyncing={actions.isSyncing}
                onSync={actions.handleSync}
                onDelete={modals.confirmDelete}
                onCopyShortName={actions.handleCopyShortName}
            />

            <Pagination
                links={animes.links}
                from={animes.from}
                to={animes.to}
                total={animes.total}
                label="animes"
            />


            <ConfirmDialog
                open={modals.isDeleteModalOpen}
                onOpenChange={modals.setIsDeleteModalOpen}
                onConfirm={modals.deleteAnime}
                title={modals.animeToDelete?.name}
                type="anime"
                processing={modals.isDeleting}
            />

            <ConfirmDialog
                open={syncAll.isConfirmOpen}
                onOpenChange={syncAll.setIsConfirmOpen}
                onConfirm={syncAll.launchSync}
                description="Se sincronizará el catálogo completo con MyAnimeList en segundo plano. Puede tardar varios minutos según la cantidad de animes."
                confirmText="Sincronizar todo"
                confirmVariant="default"
                processing={syncAll.isLaunching}
            />

            <SyncAllProgressModal
                open={syncAll.isModalOpen}
                progress={syncAll.progress}
                isStopping={syncAll.isStopping}
                onStop={syncAll.stopSync}
            />
        </div>
    );
}

AnimeIndex.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Animes', href: '#' },
    ],
};
