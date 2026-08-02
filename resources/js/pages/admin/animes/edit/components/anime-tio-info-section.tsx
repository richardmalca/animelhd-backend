import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AnimeTioInfoSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export function AnimeTioInfoSection({
    data,
    setData,
}: AnimeTioInfoSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="active_tio">Activar TioAnime</Label>
                    <p className="text-xs text-muted-foreground">
                        ¿Subir automáticamente desde TioAnime?
                    </p>
                </div>
                <Switch
                    id="active_tio"
                    checked={data.active_tio}
                    onCheckedChange={(checked) => setData('active_tio', checked)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug_tio">Slug TioAnime</Label>
                <Input
                    id="slug_tio"
                    value={data.slug_tio}
                    onChange={(e) => setData('slug_tio', e.target.value)}
                    placeholder="ej: dragon-ball-super"
                />
                <p className="text-xs text-muted-foreground">
                    El slug que aparece en la URL de TioAnime.
                </p>
            </div>
        </div>
    );
}
