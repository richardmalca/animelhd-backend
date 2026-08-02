import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useFlushCache() {
    const [isFlushing, setIsFlushing] = useState(false);
    const [showFlushConfirm, setShowFlushConfirm] = useState(false);

    const handleFlushCache = () => {
        setIsFlushing(true);
        router.post('/admin/cache/flush', {}, {
            onFinish: () => {
                setIsFlushing(false);
                setShowFlushConfirm(false);
            },
        });
    };

    return {
        isFlushing,
        showFlushConfirm,
        setShowFlushConfirm,
        handleFlushCache,
    };
}
