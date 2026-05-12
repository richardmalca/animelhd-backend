import { Link } from '@inertiajs/react';

import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium transition-transform active:scale-95"
                        >
                            <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                                <img src="/logo.webp" alt="Logo" className="size-full object-cover" />
                            </div>
                        </Link>


                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tighter text-foreground">
                                {title}
                            </h1>
                            <p className="text-xs font-medium text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
