import { Zap } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { useFlushCache } from '../hooks/use-flush-cache';

export function FlushCacheControl() {
    const { isFlushing, showFlushConfirm, setShowFlushConfirm, handleFlushCache } = useFlushCache();

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => setShowFlushConfirm(true)}
                disabled={isFlushing}
            >
                <Zap />
                <span>{isFlushing ? 'Limpiando...' : 'Vaciar Caché'}</span>
            </Button>

            <ConfirmDialog
                open={showFlushConfirm}
                onOpenChange={setShowFlushConfirm}
                onConfirm={handleFlushCache}
                title="Caché"
                description="¿Estás seguro de que deseas vaciar todo el caché de la aplicación? Esta acción obligará a todas las páginas a revalidar sus datos en la siguiente visita."
                confirmText="Vaciar Todo"
                processing={isFlushing}
            />
        </>
    );
}
