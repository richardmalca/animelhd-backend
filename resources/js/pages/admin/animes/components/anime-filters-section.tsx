import { SearchInput } from '@/components/search-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AnimeFiltersSectionProps {
    search: string;
    setSearch: (value: string) => void;
    type: string;
    setType: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
}

export function AnimeFiltersSection({
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
}: AnimeFiltersSectionProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row">
            <SearchInput 
                placeholder="Buscar anime por título..."
                value={search}
                onChange={setSearch}
            />
            <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="TV">Serie (TV)</SelectItem>
                    <SelectItem value="Movie">Película</SelectItem>
                    <SelectItem value="Special">Especial</SelectItem>
                    <SelectItem value="Ova">OVA</SelectItem>
                    <SelectItem value="Ona">ONA</SelectItem>
                </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="1">En emisión</SelectItem>
                    <SelectItem value="0">Finalizado</SelectItem>
                    <SelectItem value="2">Pausado</SelectItem>
                    <SelectItem value="3">Próximamente</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
