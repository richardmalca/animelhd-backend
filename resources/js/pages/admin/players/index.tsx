import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { PlayerGroup } from './components/player-group';
import { PlayerIndexActions } from './components/player-index-actions';
import { PlayerModal } from './components/player-modal';
import { usePlayerIndex } from './hooks/use-player-index';

export default function PlayerIndex({
    anime,
    episode,
    players,
    servers,
}: {
    anime: any;
    episode: any;
    players: any[];
    servers: any[];
}) {
    const {
        data,
        setData,
        handleCodeChange,
        isInvalidDomain,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingPlayer,
        playerToDelete,
        isDirty,
        locked,
        groupedPlayers,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deletePlayer,
        switchToEditById,
    } = usePlayerIndex(anime.id, episode.id, players, servers);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title={`Players: ${anime.name} - Ep ${episode.number}`} />

            <PageHeader
                title={
                    <span className="flex flex-col gap-2">
                        <span>Reproductores del Episodio {episode.number}</span>
                        <span className="max-w-sm text-base font-normal text-muted-foreground line-clamp-2 md:hidden">
                            {anime.name}
                        </span>
                    </span>
                }
                subtitle={anime.name}
            >
                <div className="flex items-center gap-2">
                    <PlayerIndexActions
                        onCreate={() => openCreateModal(servers[0]?.id?.toString())}
                    />
                </div>
            </PageHeader>

            {groupedPlayers.map((group) => (
                <PlayerGroup
                    key={group.key}
                    label={group.label}
                    rows={group.rows}
                    onEdit={openEditModal}
                    onDelete={confirmDelete}
                    onAdd={(serverId) => openCreateModal(serverId.toString(), group.key)}
                />
            ))}
            {groupedPlayers.length === 0 && (
                <Card>
                    <CardContent className="h-24 flex items-center justify-center text-muted-foreground">
                        No hay players registrados para este episodio.
                    </CardContent>
                </Card>
            )}

            <PlayerModal
                isOpen={isModalOpen}
                onClose={closeModal}
                submit={submit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingPlayer={editingPlayer}
                isDirty={isDirty}
                locked={locked}
                servers={servers}
                handleCodeChange={handleCodeChange}
                isInvalidDomain={isInvalidDomain}
                switchToEditById={switchToEditById}
            />

            <ConfirmDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={deletePlayer}
                title="este player"
                type="player"
                processing={processing}
            />
        </div>
    );
}

PlayerIndex.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Administración', href: '/admin' },
            { title: 'Animes', href: '/admin/animes' },
            { title: page.props?.anime?.name, href: '#' },
            {
                title: `Episodio ${page.props?.episode?.number}`,
                href: `/admin/animes/${page.props?.anime?.id}/episodes`,
            },
            { title: 'Players', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
