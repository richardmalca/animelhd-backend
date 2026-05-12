import React from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
                <CardTitle>{title}</CardTitle>
                <CardAction className="text-primary">
                    {React.cloneElement(icon as React.ReactElement<any>, {
                        className: 'size-4',
                    })}
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {total.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-green-500">+{week}</span> esta semana
                </p>
            </CardContent>
        </Card>
    );
}
