import { Head } from '@inertiajs/react';
import { Tv, Play, Users, FileVideo, Tag, Server } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import type { DashboardStats } from '@/types/dashboard';
import { FlushCacheControl } from './components/flush-cache-control';
import { RecentAnimes } from './components/recent-animes';
import { RecentEpisodes } from './components/recent-episodes';
import { StatCard } from './components/stat-card';

export default function Admin({ stats }: { stats: DashboardStats }) {
    return (
        <>
            <Head title="Panel de Control" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Panel de Administración"
                    subtitle="Resumen general de todas las estadísticas de la plataforma"
                >
                    <div className="flex items-center gap-2">
                        <FlushCacheControl />
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentAnimes animes={stats.recent_animes} />
                    </div>
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
