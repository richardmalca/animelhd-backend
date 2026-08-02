import { Link } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { RecentEpisode } from '@/types/dashboard';

export function RecentEpisodes({ episodes }: { episodes: RecentEpisode[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Últimos Episodios</CardTitle>
                <CardAction>
                    <Badge variant="outline">{episodes.length}</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    {episodes.map((episode, index) => (
                        <div key={episode.id}>
                            {index > 0 && <Separator className="my-3" />}
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center bg-muted text-primary ring-1 ring-border">
                                    <Play className="size-4" />
                                </div>
                                <div className="flex-1 space-y-0.5">
                                    <p className="line-clamp-1 font-medium">{episode.anime?.name}</p>
                                    <Badge variant="secondary">Episodio {episode.number}</Badge>
                                </div>
                                <Button variant="ghost" size="icon-sm" asChild>
                                    <Link href={`/admin/animes/${episode.anime_id}/episodes`}>
                                        <Play />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
