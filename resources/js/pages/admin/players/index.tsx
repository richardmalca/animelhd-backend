import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Plus, Play, ArrowLeft } from 'lucide-react';
import { PlayerModal } from './player-modal';
import { usePlayer } from '@/hooks/use-player';
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
import { PlayerListRow } from './components/player-list-row';

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
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deletePlayer,
        switchToEditById,
    } = usePlayer(anime.id, episode.id, players, servers);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title={`Players: ${anime.name} - Ep ${episode.number}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/animes/${anime.id}/episodes`}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <Play className="size-6 text-muted-foreground" />
                            {anime.name} - Episodio {episode.number}
                        </div>
                    </div>
                }
                subtitle="Gestionando opciones de reproducción"
            >
                <Button 
                    onClick={() => openCreateModal(servers[0]?.id?.toString())} 
                    className="gap-2"
                >
                    <Plus className="size-4" />
                    <span>Nuevo Player</span>
                </Button>
            </PageHeader>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Servidor</TableHead>
                            <TableHead>Idioma</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Agregado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player) => (
                            <PlayerListRow 
                                key={player.id}
                                player={player}
                                onEdit={openEditModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                        {players.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No hay players registrados para este episodio.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PlayerModal
                isOpen={isModalOpen}
                onClose={closeModal}
                submit={submit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                editingPlayer={editingPlayer}
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
