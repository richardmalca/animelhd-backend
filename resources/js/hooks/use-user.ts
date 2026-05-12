import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useUser = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const togglePremium = useCallback((id: number) => {
        setIsProcessing(true);
        router.post(`/admin/users/${id}/toggle-premium`, {}, {
            onSuccess: () => {
                toast.success('Estado Premium actualizado');
            },
            onError: () => {
                toast.error('Error al actualizar estado Premium');
            },
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    }, []);

    const searchUsers = useCallback((filters: { search?: string; isPremium?: string }) => {
        router.get(
            '/admin/users',
            filters,
            {
                preserveState: true,
                replace: true,
            }
        );
    }, []);

    return {
        isProcessing,
        togglePremium,
        searchUsers,
    };
};
