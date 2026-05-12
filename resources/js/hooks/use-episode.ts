import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';

export const useEpisode = (defaultAnimeId?: string) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingEpisode, setEditingEpisode] = useState<any>(null);
    const [episodeToDelete, setEpisodeToDelete] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        number: '1',
        anime_id: defaultAnimeId || '',
    });

    const openCreateModal = () => {
        setEditingEpisode(null);
        reset();
        setData((prev) => ({
            ...prev,
            number: '1',
            anime_id: defaultAnimeId || '',
        }));
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (episode: any) => {
        setEditingEpisode(episode);
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

    return {
        data,
        setData,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingEpisode,
        episodeToDelete,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteEpisode,
    };
};
