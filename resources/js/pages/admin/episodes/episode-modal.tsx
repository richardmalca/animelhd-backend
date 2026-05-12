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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';

export function EpisodeModal({
    isOpen,
    onClose,
    submit,
    data,
    setData,
    errors,
    processing,
    editingEpisode,
    anime,
    animes,
}: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{editingEpisode ? 'Editar Episodio' : 'Nuevo Episodio'}</DialogTitle>
                        <DialogDescription>
                            {editingEpisode ? 'Modifica los datos del episodio.' : 'Crea un nuevo episodio para esta serie.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!anime && (
                            <div className="space-y-2">
                                <Label htmlFor="anime_id">Anime</Label>
                                <Select value={data.anime_id} onValueChange={(val) => setData('anime_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un anime" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {animes?.map((a: any) => (
                                            <SelectItem key={a.id} value={a.id.toString()}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.anime_id} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="number">Número de Episodio</Label>
                            <Input
                                id="number"
                                type="number"
                                step="0.1"
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                                placeholder="Ej: 1"
                                autoFocus
                            />
                            <InputError message={errors.number} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {editingEpisode ? 'Guardar Cambios' : 'Crear Episodio'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
