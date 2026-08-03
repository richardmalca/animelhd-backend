import InputError from '@/components/input-error';
import { TagInput } from '@/components/tag-input';
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
import { Switch } from '@/components/ui/switch';

export function ServerEditModal({
    isOpen,
    onClose,
    submit,
    data,
    setData,
    errors,
    processing,
}: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Editar Servidor</DialogTitle>
                        <DialogDescription>
                            Modifica la información y configuración del servidor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Título</Label>
                            <Input
                                id="edit-title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ej: Fembed, Mega..."
                            />
                            <InputError message={errors.title} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit-embed">Dominio Base (URL)</Label>
                            <Input
                                id="edit-embed"
                                value={data.embed}
                                onChange={(e) => setData('embed', e.target.value)}
                                placeholder="https://voe.sx"
                            />
                            <InputError message={errors.embed} />
                        </div>

                        <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                            <h4 className="text-sm font-medium">Visibilidad</h4>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-show_web_desktop" className="text-sm">Mostrar en Web (Desktop)</Label>
                                <Switch
                                    id="edit-show_web_desktop"
                                    checked={data.show_on_web_desktop}
                                    onCheckedChange={(checked) => setData('show_on_web_desktop', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-show_web_mobile" className="text-sm">Mostrar en Web (Móvil)</Label>
                                <Switch
                                    id="edit-show_web_mobile"
                                    checked={data.show_on_web_mobile}
                                    onCheckedChange={(checked) => setData('show_on_web_mobile', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-show_app" className="text-sm">Mostrar en App Android</Label>
                                <Switch
                                    id="edit-show_app"
                                    checked={data.show_on_app}
                                    onCheckedChange={(checked) => setData('show_on_app', checked)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Dominios Permitidos</Label>
                            <TagInput 
                                tags={data.domains} 
                                setTags={(tags) => setData('domains', tags)} 
                                placeholder="Escribe y presiona Enter..."
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Presiona Enter o coma para añadir un dominio.
                            </p>
                            <InputError message={errors.domains} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
