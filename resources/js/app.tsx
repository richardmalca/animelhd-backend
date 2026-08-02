import type { ReactNode } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

function AppShell({ children }: { children: ReactNode }) {
    useFlashToast();

    return (
        <TooltipProvider delayDuration={0}>
            {children}
            <Toaster richColors />
        </TooltipProvider>
    );
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// `createInertiaApp` solo debe ejecutarse una vez por carga de página.
// Sin este guard, HMR/react-refresh re-ejecuta este módulo y vuelve a llamar
// a `createRoot` sobre el mismo contenedor (error "container has already been
// passed to createRoot"). `import.meta.hot.invalidate()` fuerza un reload limpio.
const isBrowser = typeof window !== 'undefined';

if (isBrowser && (window as Window & { __inertiaAppBooted?: boolean }).__inertiaAppBooted) {
    import.meta.hot?.invalidate();
} else {
    if (isBrowser) {
        (window as Window & { __inertiaAppBooted?: boolean }).__inertiaAppBooted = true;
    }

    createInertiaApp({
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')) as any,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        layout: (name) => {
            switch (true) {
                case name === 'welcome':
                    return null;
                case name.startsWith('auth/'):
                    return AuthLayout;
                case name.startsWith('settings/'):
                    return [AppLayout, SettingsLayout];
                default:
                    return AppLayout;
            }
        },
        strictMode: true,
        withApp(app) {
            return <AppShell>{app}</AppShell>;
        },
        progress: {
            color: '#4B5563',
        },
    });

    initializeTheme();
}
