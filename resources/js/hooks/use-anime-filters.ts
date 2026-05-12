import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as indexAnimes } from '@/routes/admin/animes';

interface Filters {
    search?: string;
    status?: string | number;
    type?: string;
}

export function useAnimeFilters(initialFilters: Filters) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [status, setStatus] = useState(initialFilters.status?.toString() || 'all');
    const [type, setType] = useState(initialFilters.type || 'all');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const statusValue = status === 'all' ? '' : status;
            const typeValue = type === 'all' ? '' : type;
            
            const currentSearch = initialFilters.search || '';
            const currentStatus = initialFilters.status?.toString() || '';
            const currentType = initialFilters.type || '';

            if (
                search !== currentSearch ||
                statusValue !== currentStatus ||
                typeValue !== currentType
            ) {
                router.get(
                    indexAnimes.url({ query: { search, status: statusValue, type: typeValue } }),
                    {},
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, status, type, initialFilters]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        type,
        setType
    };
}
