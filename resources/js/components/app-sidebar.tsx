import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Settings,
    Tv,
    Radio,
    Key,
    Tag,
    Server,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const platformNavItems: NavItem[] = [
        {
            title: 'Administración',
            href: '/admin',
            icon: LayoutGrid,
        },
        {
            title: 'Animes',
            href: '/admin/animes',
            icon: Tv,
        },
        {
            title: 'Géneros',
            href: '/admin/genres',
            icon: Tag,
        },
        {
            title: 'Servidores',
            href: '/admin/servers',
            icon: Server,
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
            icon: Users,
        },
    ];

    const settingsNavItems: NavItem[] = [
        {
            title: 'Configuraciones',
            href: '/admin/settings',
            icon: Settings,
        },
    ];


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="space-y-4">
                <NavMain items={platformNavItems} label="Plataforma" />
                <NavMain items={settingsNavItems} label="Ajustes" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
