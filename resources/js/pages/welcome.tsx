import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { props } = usePage();
    const auth = (props as any)?.auth;

    const appName = import.meta.env.VITE_APP_NAME || 'Kawaii Animes';

    return (
        <>
            <Head title={`API - ${appName}`} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground selection:bg-primary selection:text-primary-foreground">
                <div className="w-full max-w-sm space-y-12 text-center">
                    <div className="space-y-6">
                        <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                            <img src="/logo.webp" alt="Logo" className="size-full object-cover" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tighter">
                                {appName}
                            </h1>
                            <p className="text-xs font-medium text-muted-foreground">
                                Nodo de infraestructura
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto h-px w-12 bg-border" />

                    <div>
                        {auth?.user ? (
                            <Link
                                href="/admin"
                                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Entrar al panel
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-block rounded-full border border-border px-12 py-4 text-xs font-bold transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                                Acceso autorizado
                            </Link>
                        )}
                    </div>
                </div>

                <footer className="absolute bottom-12">
                    <p className="text-[10px] font-medium text-muted-foreground/30">
                        &copy; {new Date().getFullYear()} ALHD
                    </p>
                </footer>
            </div>
        </>
    );
}
