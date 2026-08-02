import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getTmdbImageUrl } from '@/utils/tmdb';
import type { RecentAnime } from '@/types/dashboard';

export function RecentAnimes({ animes }: { animes: RecentAnime[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Animes Recientes</CardTitle>
                <CardAction>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/animes">Ver todos</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    {animes.map((anime, index) => (
                        <div key={anime.id}>
                            {index > 0 && <Separator className="my-3" />}
                            <div className="flex items-center gap-4">
                                <Avatar size="lg">
                                    <AvatarImage src={getTmdbImageUrl(anime.poster)} alt={anime.name} />
                                    <AvatarFallback>{anime.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-0.5">
                                    <p className="line-clamp-1 font-medium">{anime.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Añadido el {new Date(anime.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/admin/animes/${anime.id}/edit`}>Gestionar</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/admin/animes">Ver todos los animes</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
