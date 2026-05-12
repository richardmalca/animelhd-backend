import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface AnimeImageSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export function AnimeImageSection({
    data,
    setData,
}: AnimeImageSectionProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="poster">URL del Poster</Label>
                    <Input
                        id="poster"
                        value={data.poster}
                        onChange={(e) => setData('poster', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner">URL del Banner</Label>
                    <Input
                        id="banner"
                        value={data.banner}
                        onChange={(e) => setData('banner', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>
    );
}
