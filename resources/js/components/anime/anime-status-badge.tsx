import { Badge } from '@/components/ui/badge';

export function AnimeStatusBadge({ status }: { status: number }) {
    switch (status) {
        case 0:
            return <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/5">Finalizado</Badge>;
        case 1:
            return <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Emisión</Badge>;
        case 2:
            return <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">Pausado</Badge>;
        case 3:
            return <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/5">Próximamente</Badge>;
        default:
            return <Badge variant="outline">N/A</Badge>;
    }
}
