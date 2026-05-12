import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Key } from 'lucide-react';
import { toast } from 'sonner';

interface UserPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
}

export function UserPasswordModal({
    open,
    onOpenChange,
    user,
}: UserPasswordModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        password: '',
    });

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let pass = '';
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', pass);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        post(`/admin/users/${user.id}/update-password`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                toast.success('Contraseña actualizada correctamente');
            },
            onError: () => {
                toast.error('Error al actualizar la contraseña');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                        Estás cambiando la contraseña de{' '}
                        <span className="font-bold text-foreground">
                            {user?.name}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 py-4">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="password"
                                type="text"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Escribe o genera una contraseña"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={generatePassword}
                                title="Generar"
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !data.password}>
                            {processing ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
