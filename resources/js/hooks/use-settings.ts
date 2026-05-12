import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useSettings(settings: any) {
    const { data, setData, post, processing, errors } = useForm({
        tmdb_api_key: settings.tmdb_api_key || '',
        mal_client_id: settings.mal_client_id || '',
        telegram_bot_token: settings.telegram_bot_token || '',
        telegram_chat_id: settings.telegram_chat_id || '',
        voe_email: settings.voe_email || '',
        voe_password: settings.voe_password || '',
        frontend_url: settings.frontend_url || '',
        server_keys: settings.server_keys || [],
    });


    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Configuración actualizada'),
            onError: () => toast.error('Error al guardar'),
        });
    };


    return {
        data,
        setData,
        processing,
        errors,
        handleSubmit,
    };
}
