import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GenreModalProps {
    isOpen: boolean;
    onClose: () => void;
    submit: (e: React.FormEvent) => void;
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    editingGenre: any;
}

export function GenreModal({
    isOpen,
    onClose,
    submit,
    data,
    setData,
    errors,
    processing,
    editingGenre,
}: GenreModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingGenre ? 'Editar Género' : 'Nuevo Género'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingGenre
                                ? 'Actualiza la información del género seleccionado.'
                                : 'Crea una nueva categoría para tus animes.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ej: Acción"
                                autoFocus
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (Opcional)</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="ej: accion"
                            />
                            <InputError message={errors.slug} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name_mal">Nombre en MyAnimeList</Label>
                            <Input
                                id="name_mal"
                                value={data.name_mal}
                                onChange={(e) => setData('name_mal', e.target.value)}
                                placeholder="Ej: Action"
                            />
                            <InputError message={errors.name_mal} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {editingGenre ? 'Guardar Cambios' : 'Crear Género'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
