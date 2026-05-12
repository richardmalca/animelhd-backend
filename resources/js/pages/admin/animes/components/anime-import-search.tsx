import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AnimeImportSearchProps {
    query: string;
    setQuery: (query: string) => void;
    hasApiKey: boolean;
    loading: boolean;
}

export function AnimeImportSearch({
    query,
    setQuery,
    hasApiKey,
    loading,
}: AnimeImportSearchProps) {
    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                autoFocus
                placeholder={hasApiKey ? 'Buscar en TMDB...' : 'Configura tu API Key para buscar...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!hasApiKey}
                className="h-10 pl-12"
            />
            {loading && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}
