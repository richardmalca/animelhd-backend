import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { SyncAllProgressState } from '../components/sync-all-progress-modal';

const POLL_INTERVAL_MS = 1500;

const EMPTY_PROGRESS: SyncAllProgressState = {
    active: false,
    current: 0,
    total: 0,
    last_anime: null,
};

export function useSyncAllProgress() {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [progress, setProgress] = useState<SyncAllProgressState>(EMPTY_PROGRESS);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Evita el doble toast de finalización: con `strictMode` de Inertia (React
    // StrictMode en dev) el efecto de montaje corre dos veces, dejando dos
    // polls en vuelo por un instante; ambos pueden detectar `active: false`
    // casi al mismo tiempo. Este flag garantiza un solo aviso por sync.
    const hasNotifiedEndRef = useRef(false);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await fetch('/admin/animes/sync-progress');
            const data: SyncAllProgressState = await response.json();

            if (!data.active) {
                stopPolling();
                setIsModalOpen((wasOpen) => {
                    if (wasOpen && !hasNotifiedEndRef.current) {
                        hasNotifiedEndRef.current = true;
                        if (data.stale) {
                            toast.warning(
                                'La sincronización dejó de responder (el worker se detuvo o el servidor se reinició) y se marcó como interrumpida. Podés volver a iniciarla.',
                            );
                        } else {
                            toast.success('Sincronización masiva completada');
                        }
                    }
                    return false;
                });
                setProgress(EMPTY_PROGRESS);
                return;
            }

            hasNotifiedEndRef.current = false;
            setProgress(data);
            setIsModalOpen(true);
        } catch {
            // Silenciamos errores puntuales de red: el siguiente tick reintenta.
        }
    };

    const startPolling = () => {
        stopPolling();
        fetchProgress();
        intervalRef.current = setInterval(fetchProgress, POLL_INTERVAL_MS);
    };

    // Al montar (o volver a esta página), revisa si ya hay una sincronización
    // en curso (p. ej. se disparó antes y se navegó a otra pantalla) y retoma
    // el seguimiento en vivo sin que el usuario tenga que volver a pedirlo.
    useEffect(() => {
        fetchProgress();
        intervalRef.current = setInterval(fetchProgress, POLL_INTERVAL_MS);

        return () => stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openConfirm = () => setIsConfirmOpen(true);

    const launchSync = () => {
        setIsLaunching(true);
        router.post(
            '/admin/animes/sync-all',
            {},
            {
                onSuccess: () => {
                    toast.success('Sincronización masiva iniciada');
                    setIsConfirmOpen(false);
                    startPolling();
                },
                onError: (errors: any) => {
                    toast.error(errors.error || 'No se pudo iniciar la sincronización');
                },
                onFinish: () => setIsLaunching(false),
            },
        );
    };

    const stopSync = async () => {
        setIsStopping(true);
        try {
            // Endpoint devuelve JSON (no una respuesta Inertia), por eso se usa
            // fetch directo en vez de router.post — igual que el polling de progreso.
            const response = await fetch('/admin/animes/sync-stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (!response.ok) {
                throw new Error();
            }

            toast.info('Señal de parada enviada, terminando el lote actual...');
        } catch {
            toast.error('No se pudo enviar la señal de parada');
        } finally {
            setIsStopping(false);
        }
    };

    return {
        isConfirmOpen,
        setIsConfirmOpen,
        isModalOpen,
        isLaunching,
        isStopping,
        progress,
        openConfirm,
        launchSync,
        stopSync,
    };
}
