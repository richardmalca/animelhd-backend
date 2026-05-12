import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export function Pagination({ links, from, to, total, label = 'items', className }: PaginationProps) {
    if (links.length <= 3) {
return null;
}

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-4", className)}>
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                {from !== undefined && to !== undefined && total !== undefined ? (
                    <>Mostrando {from} a {to} de {total} {label}</>
                ) : (
                    <>Total: {total} {label}</>
                )}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-1 order-1 sm:order-2">
                {links.map((link, index) => {
                    const isPrev = link.label.includes('Previous');

                    const isNext = link.label.includes('Next');
                    
                    return (
                        <Button
                            key={index}
                            variant={link.active ? 'default' : 'outline'}
                            size={isPrev || isNext ? 'default' : 'sm'}
                            asChild
                            disabled={!link.url}
                            className={cn(
                                !link.url && 'pointer-events-none opacity-50',
                                (isPrev || isNext) && 'px-3',
                                link.active && 'pointer-events-none'
                            )}
                        >
                            <Link
                                href={link.url || '#'}
                                className="flex items-center gap-1"
                            >
                                {isPrev && <ChevronLeft className="size-4" />}
                                {!isPrev && !isNext && (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                                {isNext && <ChevronRight className="size-4" />}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
