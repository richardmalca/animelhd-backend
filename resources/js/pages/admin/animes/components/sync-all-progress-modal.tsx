import { Loader2, OctagonX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export interface SyncAllProgressState {
    active: boolean;
    current: number;
    total: number;
    last_anime: string | null;
    updated_at?: number;
    stale?: boolean;
}

interface SyncAllProgressModalProps {
    open: boolean;
    progress: SyncAllProgressState;
    isStopping: boolean;
    onStop: () => void;
}

export function SyncAllProgressModal({ open, progress, isStopping, onStop }: SyncAllProgressModalProps) {
    const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sincronizando con MyAnimeList
                    </DialogTitle>
                    <DialogDescription>
                        Esto corre en segundo plano (cola de Laravel). Podés dejar esta ventana
                        abierta para seguir el avance en vivo, o cerrarla — la sincronización
                        continúa igual; al volver a esta página se retoma el seguimiento
                        automáticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {progress.total > 0 ? (
                        <>
                            <Progress value={percent} />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    {progress.current} / {progress.total} animes
                                </span>
                                <span>{percent}%</span>
                            </div>
                            {progress.last_anime && (
                                <p className="truncate text-sm text-muted-foreground">
                                    Último procesado: <span className="text-foreground">{progress.last_anime}</span>
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Esperando a que el worker de la cola tome el trabajo...
                        </p>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="destructive" onClick={onStop} disabled={isStopping}>
                        <OctagonX />
                        {isStopping ? 'Deteniendo...' : 'Detener sincronización'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
