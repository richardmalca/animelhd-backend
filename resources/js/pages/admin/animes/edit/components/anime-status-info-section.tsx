import { Search, Star } from 'lucide-react';
import InputError from '@/components/input-error';
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

interface AnimeStatusInfoSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    isTmdbChanged: boolean;
    isMalChanged: boolean;
    onOpenMalSearch: () => void;
}

export function AnimeStatusInfoSection({
    data,
    setData,
    errors,
    isTmdbChanged,
    isMalChanged,
    onOpenMalSearch,
}: AnimeStatusInfoSectionProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="short_name">Nombre Corto</Label>
                <Input
                    id="short_name"
                    placeholder="Ej: Solo Leveling..."
                    value={data.short_name}
                    onChange={(e) => setData('short_name', e.target.value)}
                />
                <InputError message={errors.short_name} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TV">Serie (TV)</SelectItem>
                            <SelectItem value="Movie">Película</SelectItem>
                            <SelectItem value="Special">Especial</SelectItem>
                            <SelectItem value="Ova">OVA</SelectItem>
                            <SelectItem value="Ona">ONA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">En emisión</SelectItem>
                            <SelectItem value="0">Finalizado</SelectItem>
                            <SelectItem value="2">Pausado</SelectItem>
                            <SelectItem value="3">Próximamente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="aired">Estreno</Label>
                    <Input
                        id="aired"
                        type="date"
                        value={data.aired}
                        onChange={(e) => setData('aired', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="premiered">Temporada</Label>
                    <Input id="premiered" value={data.premiered} readOnly disabled />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Clasificación</Label>
                <Select value={data.rating} onValueChange={(val) => setData('rating', val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Selecciona una clasificación">Selecciona una clasificación</SelectItem>
                        <SelectItem value="Apto para todos los públicos">Apto para todos los públicos</SelectItem>
                        <SelectItem value="Apto para niños">Apto para niños</SelectItem>
                        <SelectItem value="Apto para mayores de 13 años">Apto para mayores de 13 años</SelectItem>
                        <SelectItem value="Apto para mayores de 17 años">Apto para mayores de 17 años</SelectItem>
                        <SelectItem value="Apto para mayores de 17 años (Restringido)">Apto para mayores de 17 años (Restringido)</SelectItem>
                        <SelectItem value="Contenido para adultos">Contenido para adultos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Día Emisión</Label>
                    <Select value={data.broadcast} onValueChange={(val) => setData('broadcast', val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Sin definir</SelectItem>
                            <SelectItem value="1">Lunes</SelectItem>
                            <SelectItem value="2">Martes</SelectItem>
                            <SelectItem value="3">Miércoles</SelectItem>
                            <SelectItem value="4">Jueves</SelectItem>
                            <SelectItem value="5">Viernes</SelectItem>
                            <SelectItem value="6">Sábado</SelectItem>
                            <SelectItem value="7">Domingo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="popularity">Popularidad</Label>
                    <Input id="popularity" value={data.popularity} readOnly disabled />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="vote_average">Puntuación</Label>
                <div className="relative">
                    <Star className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="vote_average"
                        type="number"
                        step="0.1"
                        className="pl-8"
                        value={data.vote_average}
                        onChange={(e) => setData('vote_average', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="mal_id">ID MyAnimeList</Label>
                    <div className="relative">
                        <Input
                            id="mal_id"
                            type="number"
                            className={`pr-8 ${isMalChanged ? 'border-orange-500' : ''}`}
                            value={data.mal_id}
                            onChange={(e) => setData('mal_id', e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="absolute top-1/2 right-1 -translate-y-1/2"
                            onClick={onOpenMalSearch}
                            title="Buscar ID en MyAnimeList"
                        >
                            <Search />
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tmdb_id">ID TMDB</Label>
                    <Input
                        id="tmdb_id"
                        type="number"
                        className={isTmdbChanged ? 'border-orange-500' : ''}
                        value={data.tmdb_id}
                        onChange={(e) => setData('tmdb_id', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
