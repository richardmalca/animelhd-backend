import { Link } from '@inertiajs/react';
import { Clock, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RecentEpisode } from '@/types/dashboard';


export function RecentEpisodes({ episodes }: { episodes: RecentEpisode[] }) {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Últimos Episodios</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {episodes.map((episode) => (
                        <div key={episode.id} className="group flex items-center gap-4 rounded-xl border border-transparent p-2 transition-all hover:border-border hover:bg-muted/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Clock className="size-5" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                                <p className="font-bold text-[13px]">Episodio {episode.number}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider line-clamp-1">
                                    {episode.anime?.name}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <Link 
                                    href={`/admin/animes/${episode.anime_id}/episodes`}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all hover:scale-110 group-hover:opacity-100"
                                >
                                    <Play className="size-3 fill-current" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
