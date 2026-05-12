import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';

export interface EpisodeStatus {
    number: number;
    exists: boolean;
    local_id?: number;
    voe_link?: string;
    voe_page?: string;
    loading_link?: boolean;
    process_status?:
        | 'idle'
        | 'downloading'
        | 'cleaning'
        | 'uploading'
        | 'completed'
        | 'error';
    new_code?: string;
    message?: string;
    logs?: string[];
}

export interface CheckData {
    anime: any;
    episodes: EpisodeStatus[];
}

export function useTioAnime() {
    const [checkData, setCheckData] = useState<CheckData | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Echo listener removed
    useEffect(() => {
        // No-op
    }, []);

    const updateEpisodeState = useCallback((
        num: number,
        status: EpisodeStatus['process_status'],
        extra = {},
        logMessage?: string
    ) => {
        setCheckData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                episodes: prev.episodes.map((ep) =>
                    ep.number === num
                        ? {
                            ...ep,
                            process_status: status,
                            ...extra,
                            logs: logMessage ? [...(ep.logs || []), logMessage] : ep.logs
                        }
                        : ep
                ),
            };
        });
    }, []);

    const handleToggle = (id: number, currentStatus: boolean) => {
        router.post(
            `/admin/animes/tioanime/${id}/toggle`,
            { active: !currentStatus },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Estado actualizado'),
            }
        );
    };

    const handleSync = async (anime: any) => {
        const toastId = toast.loading(`Verificando ${anime.name}...`);
        setIsChecking(true);
        try {
            const response = await axios.get(`/admin/animes/tioanime/check/${anime.id}`);
            // Ensure episodes have logs initialized
            const data = response.data;
            data.episodes = data.episodes.map((ep: any) => ({ ...ep, logs: [] }));
            setCheckData(data);
            toast.success('Información obtenida', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Error al sincronizar', { id: toastId });
        } finally {
            setIsChecking(false);
        }
    };

    const handleStartProcess = async (num: number) => {
        if (!checkData?.anime) return;
        
        updateEpisodeState(num, 'downloading', { 
            message: 'Iniciando...', 
            logs: ['Solicitud enviada al servidor'] 
        });

        try {
            await axios.post('/admin/animes/tioanime/start-process', {
                anime_id: checkData.anime.id,
                episode: num,
            });
            updateEpisodeState(num, 'completed', { message: 'Proceso finalizado' }, 'Proceso completado exitosamente');
            toast.success(`EP ${num}: Proceso completado`);
        } catch (error: any) {
            console.error(error);
            toast.error(`EP ${num}: Error al iniciar`);
            updateEpisodeState(num, 'error', {}, 'Error durante el procesamiento');
        }
    };

    const closeCheckModal = () => setCheckData(null);

    return {
        checkData,
        isChecking,
        handleToggle,
        handleSync,
        handleStartProcess,
        closeCheckModal,
    };
}
