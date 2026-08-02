import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types/anime';

interface PaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    label?: string;
    className?: string;
}

function buildPageUrl(page: number): string {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));

    return url.pathname + url.search;
}

function buildPages(currentPage: number, lastPage: number, windowSize: number): Array<number | null> {
    const pages: Array<number | null> = [];

    if (lastPage <= windowSize) {
        for (let i = 1; i <= lastPage; i++) {
            pages.push(i);
        }

        return pages;
    }

    const start = Math.max(1, Math.min(currentPage - Math.floor((windowSize - 1) / 2), lastPage - windowSize + 1));
    const end = Math.min(lastPage, start + windowSize - 1);

    if (start > 1) {
        pages.push(1);
        if (start > 2) {
            pages.push(null);
        }
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < lastPage) {
        if (end < lastPage - 1) {
            pages.push(null);
        }
        pages.push(lastPage);
    }

    return pages;
}

export function Pagination({ links, from, to, total, label = 'items', className }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    const isMobile = useIsMobile();
    const windowSize = isMobile ? 3 : 5;

    const allNumbers = links
        .filter((link) => /^\d+$/.test(link.label))
        .map((link) => parseInt(link.label, 10));
    const lastPage = allNumbers.length ? Math.max(...allNumbers) : 1;
    const currentLink = links.find((link) => link.active);
    const currentPage = currentLink ? parseInt(currentLink.label, 10) : 1;
    const pages = buildPages(currentPage, lastPage, windowSize);
    const prevUrl = currentPage > 1 ? buildPageUrl(currentPage - 1) : null;
    const nextUrl = currentPage < lastPage ? buildPageUrl(currentPage + 1) : null;

    return (
        <div className={cn("flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <p className="order-2 text-center text-sm text-muted-foreground sm:order-1 sm:text-left">
                {from !== undefined && to !== undefined && total !== undefined ? (
                    <>Mostrando {from} a {to} de {total} {label}</>
                ) : (
                    <>Total: {total} {label}</>
                )}
            </p>

            <div className="order-1 flex flex-wrap items-center justify-center gap-1 sm:order-2">
                <Button
                    variant="outline"
                    size="sm"
                    asChild={!!prevUrl}
                    disabled={!prevUrl}
                    className={cn(!prevUrl && 'pointer-events-none opacity-50')}
                >
                    {prevUrl ? (
                        <Link href={prevUrl} className="flex items-center gap-1">
                            <ChevronLeft />
                        </Link>
                    ) : (
                        <ChevronLeft />
                    )}
                </Button>
                {pages.map((page, index) =>
                    page === null ? (
                        <span key={index} className="px-1 text-muted-foreground">
                            …
                        </span>
                    ) : (
                        <Button
                            key={index}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            asChild
                            className={cn(page === currentPage && 'pointer-events-none')}
                        >
                            <Link href={buildPageUrl(page)}>{page}</Link>
                        </Button>
                    ),
                )}
                <Button
                    variant="outline"
                    size="sm"
                    asChild={!!nextUrl}
                    disabled={!nextUrl}
                    className={cn(!nextUrl && 'pointer-events-none opacity-50')}
                >
                    {nextUrl ? (
                        <Link href={nextUrl} className="flex items-center gap-1">
                            <ChevronRight />
                        </Link>
                    ) : (
                        <ChevronRight />
                    )}
                </Button>
            </div>
        </div>
    );
}
