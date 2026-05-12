import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


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
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label className="text-sm">Activar TioAnime</Label>
                    <p className="text-[10px] text-muted-foreground">
                        ¿Subir automáticamente desde TioAnime?
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={data.active_tio}
                        onChange={(e) => setData('active_tio', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug_tio">Slug TioAnime</Label>
                <Input
                    id="slug_tio"
                    value={data.slug_tio}
                    onChange={(e) => setData('slug_tio', e.target.value)}
                    placeholder="ej: dragon-ball-super"
                    className="h-9"
                />
                <p className="text-[10px] text-muted-foreground">
                    El slug que aparece en la URL de TioAnime.
                </p>
            </div>
        </div>
    );
}
