import { Badge } from '@/components/ui/badge';

export function AnimeTypeBadge({ type }: { type: string }) {
    const getTypeConfig = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'TV': 
                return { label: 'Serie', className: 'text-primary border-primary/20 bg-primary/5' };
            case 'MOVIE': 
                return { label: 'Película', className: 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5' };
            case 'SPECIAL': 
                return { label: 'Especial', className: 'text-pink-500 border-pink-500/20 bg-pink-500/5' };
            case 'OVA': 
                return { label: 'OVA', className: 'text-slate-500 border-slate-500/20 bg-slate-500/5' };
            case 'ONA': 
                return { label: 'ONA', className: 'text-slate-500 border-slate-500/20 bg-slate-500/5' };
            default: 
                return { label: type || 'Serie', className: 'text-primary border-primary/20 bg-primary/5' };
        }
    };

    const { label, className } = getTypeConfig(type);
    
    return (
        <Badge variant="outline" className={className}>
            {label}
        </Badge>
    );
}
