import { Link } from '@inertiajs/react';
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AnimeImportHeaderProps {
    hasApiKey: boolean;
}

export function AnimeImportHeader({ hasApiKey }: AnimeImportHeaderProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/animes">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Importar Anime</h1>
                        <p className="text-sm text-muted-foreground">Busca y agrega contenido directamente desde TMDB</p>
                    </div>
                </div>
            </div>

            {!hasApiKey && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Configuración Requerida</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <p>Debes configurar tu clave de API de TMDB para poder importar contenido.</p>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/settings">
                                <Settings />
                                Ir a Configuración
                            </Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
