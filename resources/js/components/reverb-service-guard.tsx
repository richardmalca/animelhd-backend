import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';

export function ReverbServiceGuard() {
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = () => {
        setIsActivating(true);
        router.post('/admin/settings/realtime/start', {}, {
            onSuccess: () => {
                toast.success('Servicio en tiempo real activado correctamente');
                setIsActivating(false);
            },
            onError: () => setIsActivating(false)
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle>Reverb Requerido</CardTitle>
                    <CardDescription>
                        El servicio de tiempo real es obligatorio para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    El servidor ha detectado que Reverb no está activo. Por favor, inicie el servicio para desbloquear el panel administrativo.
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleActivate} 
                        className="w-full" 
                        disabled={isActivating}
                    >
                        {isActivating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Conectando
                            </>
                        ) : (
                            "Activar ahora"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
