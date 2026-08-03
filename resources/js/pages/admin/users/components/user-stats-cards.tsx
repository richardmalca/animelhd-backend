import { CheckCircle, Crown, UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserStatsCardsProps {
    stats: {
        total: number;
        premium: number;
        verified: number;
        recent: number;
    };
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <Card>
                <CardContent className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Totales</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                        <Crown className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Premium</p>
                        <p className="text-2xl font-bold">{stats.premium}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                        <CheckCircle className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Verificados</p>
                        <p className="text-2xl font-bold">{stats.verified}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <UserPlus className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Últ. 3 días</p>
                        <p className="text-2xl font-bold">{stats.recent}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
