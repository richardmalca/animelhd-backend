import { Link } from '@inertiajs/react';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
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
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9"
                >
                    <Link href="/admin/animes">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Editar Anime
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Gestionando metadatos de {animeName}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={onSyncWithMal}
                    disabled={!hasMalId || isSyncingMal}
                    type="button"
                >
                    <RefreshCw
                        className={`size-4 ${isSyncingMal ? 'animate-spin' : ''}`}
                    />
                    <span>Sincronizar con MAL</span>
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={processing || !hasMalId}
                    className="h-9 gap-2"
                    type="button"
                >
                    {processing ? (
                        <RefreshCw className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    <span>
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </span>
                </Button>
            </div>
        </div>
    );
}
