import { X, Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface AnimeBasicInfoSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    altTitles: string[];
    titleInput: string;
    setTitleInput: (value: string) => void;
    onAddAltTitle: (e: React.KeyboardEvent) => void;
    onRemoveAltTitle: (title: string) => void;
    selectedGenres: string[];
    genres: any[];
    onToggleGenre: (slug: string) => void;
}

export function AnimeBasicInfoSection({
    data,
    setData,
    errors,
    altTitles,
    titleInput,
    setTitleInput,
    onAddAltTitle,
    onRemoveAltTitle,
    selectedGenres,
    genres,
    onToggleGenre,
}: AnimeBasicInfoSectionProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Título Principal</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                    />
                    <InputError message={errors.slug} />
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="name_alternative">Títulos Alternativos</Label>
                <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-md border bg-muted/20 p-2">
                    {altTitles.map((title, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="max-w-full gap-1 px-2 py-1"
                        >
                            <span className="max-w-[150px] truncate sm:max-w-[300px]">
                                {title}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemoveAltTitle(title)}
                                className="ml-1 shrink-0 transition-colors hover:text-destructive"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                    <input
                        className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none"
                        placeholder={altTitles.length === 0 ? 'Escribe y pulsa Enter o coma...' : 'Agregar más...'}
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onKeyDown={onAddAltTitle}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="overview">Sinopsis</Label>
                <Textarea
                    id="overview"
                    rows={8}
                    value={data.overview}
                    onChange={(e) => setData('overview', e.target.value)}
                    className="resize-none"
                />
            </div>

            <div className="space-y-3">
                <Label>Géneros</Label>
                <div className="flex min-h-[2.5rem] flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-2">
                    {selectedGenres.map((slug) => {
                        const genre = genres.find((g) => g.slug === slug);

                        if (!genre) {
return null;
}

                        return (
                            <Badge
                                key={slug}
                                variant="secondary"
                                className="max-w-full gap-1 px-2 py-1"
                            >
                                <span className="max-w-[150px] truncate sm:max-w-[300px]">
                                    {genre.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onToggleGenre(slug)}
                                    className="ml-1 shrink-0 transition-colors hover:text-destructive"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        );
                    })}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 border border-dashed px-2 text-xs hover:border-primary hover:text-primary"
                            >
                                <Plus className="mr-1 size-3" />
                                Agregar Géneros
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 sm:w-[450px]" align="start">
                            <div className="border-b p-4">
                                <h4 className="text-sm font-medium">Seleccionar Géneros</h4>
                                <p className="text-xs text-muted-foreground">Puedes elegir múltiples categorías</p>
                            </div>
                            <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3">
                                {genres.map((genre) => {
                                    const isSelected = selectedGenres.includes(genre.slug);

                                    return (
                                        <div
                                            key={genre.slug}
                                            onClick={() => onToggleGenre(genre.slug)}
                                            className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-all ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10 font-medium text-primary'
                                                    : 'border-transparent text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            <div className={`size-3 rounded-full border ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`} />
                                            <span className="truncate text-xs">{genre.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
