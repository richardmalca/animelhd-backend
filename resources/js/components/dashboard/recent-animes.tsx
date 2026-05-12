import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTmdbImageUrl } from '@/utils/tmdb';
import type { RecentAnime } from '@/types/dashboard';

export function RecentAnimes({ animes }: { animes: RecentAnime[] }) {


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Animes Recientes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/animes">Ver todos</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {animes.map((anime) => (
                        <div key={anime.id} className="group flex items-center gap-4 rounded-xl border border-transparent p-2 transition-all hover:border-border hover:bg-muted/50">
                            <img 
                                src={getTmdbImageUrl(anime.poster)} 
                                alt={anime.name} 
                                className="h-14 w-10 rounded-lg object-cover shadow-md"
                            />
                            <div className="flex-1 space-y-0.5">
                                <p className="font-bold text-[13px] line-clamp-1">{anime.name}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Añadido el {new Date(anime.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <Button variant="secondary" size="sm" asChild>
                                <Link href={`/admin/animes/${anime.id}/edit`}>
                                    Gestionar
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
