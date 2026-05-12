import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';


interface MalSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    query: string;
    setQuery: (query: string) => void;
    onSearch: () => void;
    results: any[];
    isSearching: boolean;
    onSelect: (anime: any) => void;
}

export function MalSearchDialog({
    open,
    onOpenChange,
    query,
    setQuery,
    onSearch,
    results,
    isSearching,
    onSelect,
}: MalSearchDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-[500px]">
                <DialogHeader className="shrink-0 border-b p-6 pb-4">
                    <DialogTitle className="text-lg">Buscar en MyAnimeList</DialogTitle>
                    <DialogDescription className="text-xs">
                        Encuentra el anime correcto para vincular su ID.
                    </DialogDescription>
                </DialogHeader>

                <div className="shrink-0 p-6 pb-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nombre del anime..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                            className="h-9 text-sm"
                        />
                        <Button onClick={onSearch} disabled={isSearching} size="sm" className="h-9 px-3">
                            <Search className={`size-4 ${isSearching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-6 pt-0">
                    {isSearching ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="mx-auto size-6 animate-spin text-muted-foreground/50" />
                            <p className="mt-2 text-xs text-muted-foreground">Buscando en MAL...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid gap-2 rounded-xl bg-muted/30 p-2 border border-muted">
                            {results.map((result: any) => (
                                <div
                                    key={result.node.id}
                                    onClick={() => onSelect(result)}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all hover:border-primary hover:bg-primary/5 group"
                                >
                                    <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                        {result.node.main_picture ? (
                                            <img
                                                src={result.node.main_picture.medium}
                                                alt={result.node.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Search className="size-4 text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <p className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                                            {result.node.title}
                                        </p>
                                        <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                                            MAL ID: {result.node.id}
                                        </p>
                                    </div>
                                    <div className="shrink-0 opacity-0 transition-all group-hover:opacity-100">
                                        <Button variant="secondary" size="sm" className="h-8 px-2 text-[10px]">
                                            Seleccionar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query && !isSearching ? (
                        <div className="py-20 text-center">
                            <p className="text-sm text-muted-foreground">No se encontraron resultados.</p>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-xs text-muted-foreground">Escribe algo para comenzar a buscar.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
