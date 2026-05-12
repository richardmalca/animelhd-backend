import { useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useServer(initialFilters: any = {}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<any>(null);
    const [serverToDelete, setServerToDelete] = useState<any>(null);
    const [search, setSearch] = useState(initialFilters.search || '');
    
    const isFirstRender = useRef(true);
    const cancelSource = useRef<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        embed: '',
        status: 1,
        show_on_web_desktop: true,
        show_on_web_mobile: true,
        show_on_app: true,
        domains: [] as string[],
    });

    useEffect(() => {
        const channel = (window as any).Echo?.channel('admin.servers');
        
        if (channel) {
            const reload = () => {
                router.reload({ 
                    only: ['servers'],
                    // @ts-ignore
                    preserveScroll: true 
                });
            };
            
            channel.listen('.ServerCreated', reload);
            channel.listen('.ServerUpdated', reload);
            channel.listen('.ServerDeleted', reload);
        }

        return () => {
            (window as any).Echo?.leaveChannel('admin.servers');
        };
    }, []);

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
                router.get('/admin/servers', query, {
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
        setEditingServer(null);
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (server: any) => {
        setEditingServer(server);
        setData({
            title: server.title || '',
            embed: server.embed || '',
            status: server.status ?? 1,
            show_on_web_desktop: server.show_on_web_desktop ?? true,
            show_on_web_mobile: server.show_on_web_mobile ?? true,
            show_on_app: server.show_on_app ?? true,
            domains: Array.isArray(server.domains) ? server.domains : [],
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingServer(null);
        reset();
        clearErrors();
    };

    const submitCreate = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/admin/servers', {
            onSuccess: () => {
                closeCreateModal();
                toast.success('Servidor creado');
            },
        });
    };

    const submitEdit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (editingServer) {
            put(`/admin/servers/${editingServer.id}`, {
                onSuccess: () => {
                    closeEditModal();
                    toast.success('Servidor actualizado');
                },
            });
        }
    };

    const confirmDelete = (server: any) => {
        setServerToDelete(server);
        setIsDeleteModalOpen(true);
    };

    const deleteServer = () => {
        if (!serverToDelete) return;

        const promise = new Promise((resolve, reject) => {
            router.delete(`/admin/servers/${serverToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setServerToDelete(null);
                    resolve(true);
                },
                onError: (errors) => reject(errors),
            });
        });

        toast.promise(promise, {
            loading: 'Eliminando servidor...',
            success: 'Servidor eliminado correctamente',
            error: 'No se pudo eliminar el servidor',
        });
    };

    return {
        data,
        setData,
        processing,
        errors,
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        editingServer,
        serverToDelete,
        openCreateModal,
        openEditModal,
        closeCreateModal,
        closeEditModal,
        setIsDeleteModalOpen,
        confirmDelete,
        submitCreate,
        submitEdit,
        deleteServer,
        search,
        setSearch,
    };
}
