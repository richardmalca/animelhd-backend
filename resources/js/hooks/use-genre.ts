import { useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useGenre(initialFilters: any = {}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<any>(null);
    const [genreToDelete, setGenreToDelete] = useState<any>(null);
    const [search, setSearch] = useState(initialFilters.search || '');
    
    const isFirstRender = useRef(true);
    const cancelSource = useRef<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        slug: '',
        name_mal: '',
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (search !== (initialFilters.search || '')) {
                if (cancelSource.current) {
                    cancelSource.current.cancel();
                }

                const query = search ? { search } : {};
                router.get('/admin/genres', query, {
                    preserveState: true,
                    replace: true,
                    onCancelToken: (token) => {
                        cancelSource.current = token;
                    }
                });
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (cancelSource.current) {
                cancelSource.current.cancel();
            }
        };
    }, [search, initialFilters.search]);

    const openCreateModal = () => {
        setEditingGenre(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (genre: any) => {
        setEditingGenre(genre);
        setData({
            title: genre.title || '',
            slug: genre.slug || '',
            name_mal: genre.name_mal || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGenre(null);
        reset();
    };

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (editingGenre) {
            put(`/admin/genres/${editingGenre.id}`, {
                onSuccess: () => {
                    closeModal();
                    toast.success('Género actualizado');
                },
            });
        } else {
            post('/admin/genres', {
                onSuccess: () => {
                    closeModal();
                    toast.success('Género creado');
                },
            });
        }
    };

    const confirmDelete = (genre: any) => {
        setGenreToDelete(genre);
        setIsDeleteModalOpen(true);
    };

    const deleteGenre = () => {
        if (!genreToDelete) return;

        const promise = new Promise((resolve, reject) => {
            router.delete(`/admin/genres/${genreToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setGenreToDelete(null);
                    resolve(true);
                },
                onError: (errors) => reject(errors),
            });
        });

        toast.promise(promise, {
            loading: 'Eliminando género...',
            success: 'Género eliminado correctamente',
            error: 'No se pudo eliminar el género',
        });
    };

    return {
        data,
        setData,
        processing,
        errors,
        isModalOpen,
        isDeleteModalOpen,
        editingGenre,
        genreToDelete,
        openCreateModal,
        openEditModal,
        closeModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submit,
        deleteGenre,
        search,
        setSearch,
    };
}
