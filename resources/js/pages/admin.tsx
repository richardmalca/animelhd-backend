import { Head, Link, router } from '@inertiajs/react';
import { Tv, Play, Users, FileVideo, Tag, Server, Plus, Zap } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentAnimes } from '@/components/dashboard/recent-animes';
import { RecentEpisodes } from '@/components/dashboard/recent-episodes';
import type { DashboardStats } from '@/types/dashboard';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function Admin({ stats }: { stats: DashboardStats }) {
    const [isFlushing, setIsFlushing] = useState(false);
    const [showFlushConfirm, setShowFlushConfirm] = useState(false);

    const handleFlushCache = () => {
        setIsFlushing(true);
        router.post('/admin/cache/flush', {}, {
            onFinish: () => {
                setIsFlushing(false);
                setShowFlushConfirm(false);
            }
        });
    };

    return (
        <>
            <Head title="Panel de Control" />

            <ConfirmDialog
                open={showFlushConfirm}
                onOpenChange={setShowFlushConfirm}
                onConfirm={handleFlushCache}
                title="Caché de Redis"
                description="¿Estás seguro de que deseas vaciar todo el caché de Redis? Esta acción obligará a todas las páginas a revalidar sus datos en la siguiente visita."
                confirmText="Vaciar Todo"
                processing={isFlushing}
            />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Panel de Administración"
                    subtitle="Resumen general de todas las estadísticas de la plataforma"
                >
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="destructive"
                            size="sm" 
                            onClick={() => setShowFlushConfirm(true)}
                            disabled={isFlushing}
                            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            <Zap className="size-4" />
                            <span>{isFlushing ? 'Limpiando...' : 'Vaciar Caché'}</span>
                        </Button>
                        <Button size="sm" asChild className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                            <Link href="/admin/animes">
                                <Plus className="size-4" />
                                <span>Nuevo Anime</span>
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        title="Animes"
                        total={stats.animes.total}
                        week={stats.animes.this_week}
                        icon={<Tv />}
                    />
                    <StatCard
                        title="Episodios"
                        total={stats.episodes.total}
                        week={stats.episodes.this_week}
                        icon={<FileVideo />}
                    />
                    <StatCard
                        title="Players"
                        total={stats.players.total}
                        week={stats.players.this_week}
                        icon={<Play />}
                    />
                    <StatCard
                        title="Géneros"
                        total={stats.genres.total}
                        week={stats.genres.this_week}
                        icon={<Tag />}
                    />
                    <StatCard
                        title="Usuarios"
                        total={stats.users.total}
                        week={stats.users.this_week}
                        icon={<Users />}
                    />
                    <StatCard
                        title="Servidores"
                        total={stats.servers.total}
                        week={stats.servers.this_week}
                        icon={<Server />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <RecentAnimes animes={stats.recent_animes} />
                    <RecentEpisodes episodes={stats.recent_episodes} />
                </div>
            </div>
        </>
    );
}

Admin.layout = {
    breadcrumbs: [
        {
            title: 'Administración',
            href: '/admin',
        },
    ],
};

