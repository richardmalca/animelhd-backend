import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAnimeImport } from '@/hooks/use-anime-import';

import { AnimeImportDuplicateDialog } from './components/anime-import-duplicate-dialog';
import { AnimeImportHeader } from './components/anime-import-header';
import { AnimeImportResultRow } from './components/anime-import-result-row';
import { AnimeImportSearch } from './components/anime-import-search';


export default function AnimeImport({ hasApiKey }: { hasApiKey: boolean }) {
    const {
        query,
        setQuery,
        results,
        loading,
        isSearching,
        importingId,
        showConfirm,
        setShowConfirm,
        pendingImport,
        importedIds,
        handleImport,
        executeImport,
    } = useAnimeImport(hasApiKey);

    const isImported = (id: number) => importedIds.includes(id);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <Head title="Importar desde TMDB" />

            <AnimeImportHeader hasApiKey={hasApiKey} />

            <AnimeImportSearch 
                query={query}
                setQuery={setQuery}
                hasApiKey={hasApiKey}
                loading={loading}
            />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">Poster</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Año</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((item) => (
                            <AnimeImportResultRow 
                                key={item.id}
                                item={item}
                                importingId={importingId}
                                isImported={isImported}
                                onImport={handleImport}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {results.length === 0 && !loading && !isSearching && query.length >= 2 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="mb-4 h-10 w-10 text-muted-foreground/20" />
                    <h2 className="text-lg font-bold">Sin Resultados</h2>
                    <p className="text-xs text-muted-foreground">Intenta con otro término de búsqueda.</p>
                </div>
            )}

            <AnimeImportDuplicateDialog 
                open={showConfirm}
                onOpenChange={setShowConfirm}
                pendingName={pendingImport?.name}
                onConfirm={() => pendingImport && executeImport(pendingImport.id, pendingImport.type)}
            />
        </div>
    );
}

AnimeImport.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Animes', href: '/admin/animes' },
        { title: 'Importar', href: '#' },
    ],
};
