import { useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

interface ParsedPlayer {
    number: number;
    url: string;
    server: any | null;
}

export const useEpisodeImport = (animeId: number, servers: any[]) => {
    const { data, setData, post, processing, errors } = useForm({
        start_number: '1',
        languaje: '0',
        players: '',
    });

    const getDetectedServer = (url: string) => {
        if (!url || !servers) return null;
        
        const cleanUrl = url.toLowerCase().trim();
        
        return servers.find(server => {
            let domains = server.domains;
            
            // Si llega como string (JSON), lo parseamos
            if (typeof domains === 'string') {
                try {
                    domains = JSON.parse(domains);
                } catch (e) {
                    domains = [];
                }
            }
            
            if (!Array.isArray(domains)) return false;

            return domains.some((d: string) => {
                const cleanDomain = d.toLowerCase().trim();
                return cleanDomain !== '' && cleanUrl.includes(cleanDomain);
            });
        });
    };

    const parsedPlayers = useMemo(() => {
        const lines = data.players.split('\n')
            .map(l => l.trim())
            .filter(l => l !== '');
            
        const start = data.start_number === '' ? 1 : parseInt(data.start_number);
        
        return lines.map((url, index) => ({
            number: start + index,
            url,
            server: getDetectedServer(url)
        }));
    }, [data.players, data.start_number, servers]);

    const submit = (mode: 'stay' | 'clear' | 'back') => {
        post(`/admin/animes/${animeId}/episodes/import`, {
            preserveScroll: true,
            onSuccess: () => {
                if (mode === 'clear') {
                    setData('players', '');
                } else if (mode === 'back') {
                    // El servidor ya redirecciona, pero esto asegura la intención
                }
            }
        });
    };

    const canImport = useMemo(() => {
        return parsedPlayers.length > 0 && parsedPlayers.every(p => p.server !== null);
    }, [parsedPlayers]);

    return {
        data,
        setData,
        parsedPlayers,
        canImport,
        processing,
        errors,
        submit
    };
};
