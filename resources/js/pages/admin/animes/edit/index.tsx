import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Search } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Anime } from '@/types/anime';
import { useAnimeEdit } from './hooks/use-anime-edit';
import { AnimeBasicInfoSection } from './components/anime-basic-info-section';
import { AnimeFormHeader } from './components/anime-form-header';
import { AnimeImageSection } from './components/anime-image-section';
import { AnimeStatusInfoSection } from './components/anime-status-info-section';
import { AnimeTioInfoSection } from './components/anime-tio-info-section';
import { MalSearchDialog } from './components/mal-search-dialog';


export default function AnimeEdit({
    anime,
    genres,
}: {
    anime: Anime;
    genres: { slug: string; title: string }[];
}) {


    const { data, setData, put, transform, processing, errors } = useForm({
        name: anime.name || '',
        name_alternative: anime.name_alternative || '',
        genres: anime.genres || '',
        slug: anime.slug || '',
        overview: anime.overview || '',
        type: anime.type || 'TV',
        status: anime.status.toString(),
        aired: anime.aired ? anime.aired.substring(0, 10) : '',
        premiered: anime.premiered || '',
        popularity: anime.popularity || 0,
        rating: anime.rating || 'Selecciona una clasificación',
        broadcast: anime.broadcast?.toString() || '0',
        tmdb_id: anime.tmdb_id || '',
        mal_id: anime.mal_id || '',
        short_name: anime.short_name || '',
        vote_average: anime.vote_average || 0,
        poster: anime.poster || '',
        banner: anime.banner || '',
        slug_tio: anime.slug_tio || '',
        active_tio: anime.active_tio || false,
    });

    const {
        altTitles,
        titleInput,
        setTitleInput,
        isMalSearchOpen,
        setIsMalSearchOpen,
        malSearchQuery,
        setMalSearchQuery,
        malResults,
        isSearchingMal,
        isSyncingMal,
        selectedGenres,
        toggleGenre,
        handleAddAltTitle,
        removeAltTitle,
        handleSubmit,
        syncWithMal,
        selectMalAnime,
        searchMal,
        isTmdbChanged,
        isMalChanged,
        showSlugConfirm,
        setShowSlugConfirm,
        slugSuggestion,
        confirmSlugSuggestion,
    } = useAnimeEdit({ anime, data, setData, put, transform });

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title={`Editar - ${anime.name}`} />

            <AlertDialog open={showSlugConfirm} onOpenChange={setShowSlugConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Slug en uso</AlertDialogTitle>
                        <AlertDialogDescription>
                            El slug que intentas usar ya está asignado a otro anime. 
                            ¿Deseas usar <span className="font-bold text-foreground">"{slugSuggestion}"</span> en su lugar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSlugSuggestion}>
                            Sí, usar sugerencia
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AnimeFormHeader 
                animeName={anime.name}
                isSyncingMal={isSyncingMal}
                processing={processing}
                hasMalId={!!data.mal_id}
                onSyncWithMal={syncWithMal}
                onSubmit={() => handleSubmit()}
            />

            {!data.mal_id && (
                <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500/20 p-2 text-orange-600">
                                <AlertCircle className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-600">ID de MyAnimeList faltante</p>
                                <p className="text-xs text-orange-600/80">Vincúlalo para obtener puntuaciones y estados precisos.</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                            onClick={() => setIsMalSearchOpen(true)}
                        >
                            <Search />
                            Buscar en MAL
                        </Button>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <AnimeBasicInfoSection 
                                data={data}
                                setData={setData}
                                errors={errors}
                                altTitles={altTitles}
                                titleInput={titleInput}
                                setTitleInput={setTitleInput}
                                onAddAltTitle={handleAddAltTitle}
                                onRemoveAltTitle={removeAltTitle}
                                selectedGenres={selectedGenres}
                                genres={genres}
                                onToggleGenre={toggleGenre}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Imágenes y Arte</CardTitle>
                            <CardDescription>URLs de poster y banner</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimeImageSection data={data} setData={setData} />
                        </CardContent>
                    </Card>

                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <AnimeStatusInfoSection 
                                data={data}
                                setData={setData}
                                errors={errors}
                                isTmdbChanged={isTmdbChanged}
                                isMalChanged={isMalChanged}
                                onOpenMalSearch={() => setIsMalSearchOpen(true)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sincronización Externa</CardTitle>
                            <CardDescription>Configuración para scrapers y subidas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimeTioInfoSection data={data} setData={setData} />
                        </CardContent>
                    </Card>
                </div>
            </form>

            <MalSearchDialog 
                open={isMalSearchOpen}
                onOpenChange={setIsMalSearchOpen}
                query={malSearchQuery}
                setQuery={setMalSearchQuery}
                onSearch={searchMal}
                results={malResults}
                isSearching={isSearchingMal}
                onSelect={selectMalAnime}
            />
        </div>
    );
}

AnimeEdit.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Animes', href: '/admin/animes' },
        { title: 'Editar', href: '#' },
    ],
};
