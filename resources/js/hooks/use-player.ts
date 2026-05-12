import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';

export const usePlayer = (animeId: number, episodeId: number, players: any[] = [], servers: any[] = []) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<any>(null);
    const [playerToDelete, setPlayerToDelete] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        server_id: '',
        code: '',
        languaje: '0',
    });

    const handleCodeChange = (val: string) => {
        setData('code', val);
        
        try {
            if (val.startsWith('http')) {
                const url = new URL(val);
                const hostname = url.hostname.toLowerCase().replace('www.', '');
                
                const currentServer = servers.find(s => s.id.toString() === data.server_id);
                const isCurrentValid = currentServer && Array.isArray(currentServer.domains) && 
                    currentServer.domains.some((d: string) => hostname.includes(d.toLowerCase()));

                if (!isCurrentValid) {
                    const matchedServer = servers.find(s => 
                        Array.isArray(s.domains) && s.domains.some((d: string) => hostname.includes(d.toLowerCase()))
                    );
                    
                    if (matchedServer) {
                        setData('server_id', matchedServer.id.toString());
                    }
                }
            }
        } catch (err) {
        }
    };

    const isInvalidDomain = () => {
        if (!data.code) return false;
        
        const code = data.code.toLowerCase().trim();
        const currentServer = servers.find(s => s.id.toString() === data.server_id);
        
        if (!currentServer || !Array.isArray(currentServer.domains) || currentServer.domains.length === 0) {
            return false;
        }

        if (code.includes('<iframe')) return false;

        try {
            let hostname = '';
            if (code.startsWith('http')) {
                hostname = new URL(code).hostname;
            } else if (code.includes('/')) {
                hostname = code.split('/')[0];
            } else {
                return !currentServer.domains.some((d: string) => code.includes(d.toLowerCase()));
            }
            
            hostname = hostname.replace('www.', '');
            
            return !currentServer.domains.some((d: string) => {
                return hostname.includes(d.toLowerCase()); 
            });
        } catch { 
            return true; 
        }
    };

    const openCreateModal = (defaultServerId?: string) => {
        setEditingPlayer(null);
        reset();
        if (defaultServerId) {
            setData('server_id', defaultServerId);
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (player: any) => {
        setEditingPlayer(player);
        setData({
            server_id: player.server_id.toString(),
            code: player.code,
            languaje: player.languaje,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const baseUrl = `/admin/animes/${animeId}/episodes/${episodeId}/players`;
        if (editingPlayer) {
            put(`${baseUrl}/${editingPlayer.id}`, {
                onSuccess: () => {
                    toast.success('Player actualizado');
                    closeModal();
                },
            });
        } else {
            post(baseUrl, {
                onSuccess: () => {
                    toast.success('Player creado');
                    closeModal();
                },
            });
        }
    };

    const confirmDelete = (player: any) => {
        setPlayerToDelete(player);
        setIsDeleteModalOpen(true);
    };

    const deletePlayer = () => {
        const baseUrl = `/admin/animes/${animeId}/episodes/${episodeId}/players`;
        router.delete(`${baseUrl}/${playerToDelete.id}`, {
            onSuccess: () => {
                toast.success('Player eliminado');
                setIsDeleteModalOpen(false);
            },
        });
    };

    const switchToEditById = (id: number) => {
        const player = players.find(p => p.id === id);
        if (player) {
            openEditModal(player);
        }
    };

    return {
        data,
        setData,
        handleCodeChange,
        isInvalidDomain,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingPlayer,
        playerToDelete,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deletePlayer,
        switchToEditById,
    };
};
