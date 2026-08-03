import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { UserEmailModal } from '@/components/user-email-modal';
import { UserPasswordModal } from '@/components/user-password-modal';
import { useUser } from '@/hooks/use-user';
import { UserFiltersSection } from './components/user-filters-section';
import { UserStatsCards } from './components/user-stats-cards';
import { UserTable } from './components/user-table';

export default function UserIndex({
    users,
    filters,
    stats,
}: {
    users: any;
    filters: any;
    stats: any;
}) {
    const { togglePremium, searchUsers, isProcessing } = useUser();
    const [search, setSearch] = useState(filters.search || '');
    const [isPremium, setIsPremium] = useState(filters.isPremium || 'all');
    
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState<any>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userToPassword, setUserToPassword] = useState<any>(null);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [userToEmail, setUserToEmail] = useState<any>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '') || isPremium !== (filters.isPremium || 'all')) {
                searchUsers({ search, isPremium });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, isPremium]);

    const confirmToggle = (user: any) => {
        setUserToToggle(user);
        setIsToggleModalOpen(true);
    };

    const openPasswordModal = (user: any) => {
        setUserToPassword(user);
        setIsPasswordModalOpen(true);
    };

    const openEmailModal = (user: any) => {
        setUserToEmail(user);
        setIsEmailModalOpen(true);
    };

    const handleToggle = () => {
        if (userToToggle) {
            togglePremium(userToToggle.id);
            setIsToggleModalOpen(false);
        }
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader 
                    title="Usuarios" 
                    subtitle="Visualiza y gestiona los usuarios registrados en la plataforma"
                />

                <UserStatsCards stats={stats} />

                <UserFiltersSection
                    search={search}
                    setSearch={setSearch}
                    isPremium={isPremium}
                    setIsPremium={setIsPremium}
                />

                <UserTable
                    users={users.data}
                    onOpenPassword={openPasswordModal}
                    onOpenEmail={openEmailModal}
                    onToggle={confirmToggle}
                />

                <Pagination
                    links={users.links}
                    from={users.from}
                    to={users.to}
                    total={users.total}
                    label="usuarios"
                />
            </div>

            {/* Modal para Toggle Premium */}
            <ConfirmDialog
                open={isToggleModalOpen}
                onOpenChange={setIsToggleModalOpen}
                onConfirm={handleToggle}
                title={userToToggle?.name}
                description={
                    userToToggle?.isPremium 
                    ? `¿Estás seguro de que deseas desactivar el acceso Premium para ${userToToggle?.name}?`
                    : `¿Estás seguro de que deseas activar el acceso Premium para ${userToToggle?.name}?`
                }
                confirmText={userToToggle?.isPremium ? "Desactivar Premium" : "Activar Premium"}
                confirmVariant={userToToggle?.isPremium ? "destructive" : "default"}
                processing={isProcessing}
            />

            {/* Modal para Cambiar Contraseña */}
            <UserPasswordModal 
                open={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                user={userToPassword}
            />

            <UserEmailModal
                open={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                user={userToEmail}
            />
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Usuarios', href: '#' },
    ],
};
