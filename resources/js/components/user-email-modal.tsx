import { useEffect } from 'react';
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
import { toast } from 'sonner';

interface UserEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
}

export function UserEmailModal({
    open,
    onOpenChange,
    user,
}: UserEmailModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        if (user) {
            setData('email', user.email);
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        post(`/admin/users/${user.id}/update-email`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                toast.success('Correo electrónico actualizado correctamente');
            },
            onError: () => {
                toast.error('Error al actualizar el correo electrónico');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Actualizar Correo Electrónico</DialogTitle>
                    <DialogDescription>
                        Estás modificando el correo de{' '}
                        <span className="font-bold text-foreground">
                            {user?.name}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 py-4">
                        <Label htmlFor="email">Nuevo Correo</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nombre@ejemplo.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
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
                        <Button type="submit" disabled={processing || !data.email || data.email === user?.email}>
                            {processing ? 'Actualizando...' : 'Actualizar Correo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
