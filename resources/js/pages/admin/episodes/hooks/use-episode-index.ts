import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useEpisodeIndex(defaultAnimeId?: string, nextEpisodeNumber: string | number = '1') {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingEpisode, setEditingEpisode] = useState<any>(null);
    const [episodeToDelete, setEpisodeToDelete] = useState<any>(null);
    const [originalData, setOriginalData] = useState<{ number: string; anime_id: string } | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        number: nextEpisodeNumber.toString(),
        anime_id: defaultAnimeId || '',
    });

    const openCreateModal = () => {
        setEditingEpisode(null);
        setOriginalData(null);
        reset();
        setData((prev) => ({
            ...prev,
            number: nextEpisodeNumber.toString(),
            anime_id: defaultAnimeId || '',
        }));
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (episode: any) => {
        setEditingEpisode(episode);
        setOriginalData({
            number: episode.number.toString(),
            anime_id: episode.anime_id.toString(),
        });
        setData({
            number: episode.number.toString(),
            anime_id: episode.anime_id.toString(),
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
        if (editingEpisode) {
            put(`/admin/episodes/${editingEpisode.id}`, {
                onSuccess: () => {
                    toast.success('Episodio actualizado');
                    closeModal();
                },
            });
        } else {
            post('/admin/episodes', {
                onSuccess: () => {
                    toast.success('Episodio creado');
                    closeModal();
                },
            });
        }
    };

    const confirmDelete = (episode: any) => {
        setEpisodeToDelete(episode);
        setIsDeleteModalOpen(true);
    };

    const deleteEpisode = () => {
        router.delete(`/admin/episodes/${episodeToDelete.id}`, {
            onSuccess: () => {
                toast.success('Episodio eliminado');
                setIsDeleteModalOpen(false);
            },
        });
    };

    const isDirty = editingEpisode
        ? originalData !== null &&
          (data.number !== originalData.number || data.anime_id !== originalData.anime_id)
        : true;

    return {
        data,
        setData,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingEpisode,
        episodeToDelete,
        isDirty,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteEpisode,
    };
}
