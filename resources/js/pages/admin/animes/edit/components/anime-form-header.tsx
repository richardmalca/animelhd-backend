import { Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimeFormHeaderProps {
    animeName: string;
    isSyncingMal: boolean;
    processing: boolean;
    hasMalId: boolean;
    onSyncWithMal: () => void;
    onSubmit: () => void;
}

export function AnimeFormHeader({
    animeName,
    isSyncingMal,
    processing,
    hasMalId,
    onSyncWithMal,
    onSubmit,
}: AnimeFormHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Editar Anime
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Gestionando metadatos de {animeName}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSyncWithMal}
                    disabled={!hasMalId || isSyncingMal}
                    type="button"
                >
                    <RefreshCw className={isSyncingMal ? 'animate-spin' : ''} />
                    <span>Sincronizar con MAL</span>
                </Button>
                <Button onClick={onSubmit} disabled={processing || !hasMalId} type="button">
                    {processing ? <RefreshCw className="animate-spin" /> : <Save />}
                    <span>
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </span>
                </Button>
            </div>
        </div>
    );
}
