import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    total: number;
    week: number;
    icon: React.ReactNode;
}

export function StatCard({ title, total, week, icon }: StatCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center bg-muted text-primary ring-1 ring-border">
                        {React.cloneElement(icon as React.ReactElement<any>, {
                            className: 'size-4',
                        })}
                    </div>
                    <div>
                        <CardDescription>{title}</CardDescription>
                        <CardTitle className="text-xl">{total.toLocaleString()}</CardTitle>
                    </div>
                </div>
                <CardAction>
                    <Badge variant="secondary">
                        <TrendingUp />
                        {week}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">Añadidos esta semana</p>
            </CardContent>
        </Card>
    );
}
