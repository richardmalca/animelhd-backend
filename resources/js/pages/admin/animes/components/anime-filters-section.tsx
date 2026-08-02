import { Filter } from 'lucide-react';
import { useState } from 'react';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
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

function TypeAndStatusSelects({
    type,
    setType,
    status,
    setStatus,
}: Pick<AnimeFiltersSectionProps, 'type' | 'setType' | 'status' | 'setStatus'>) {
    return (
        <>
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
        </>
    );
}

export function AnimeFiltersSection({
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
}: AnimeFiltersSectionProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <SearchInput
                    placeholder="Buscar anime por título..."
                    value={search}
                    onChange={setSearch}
                />
                <Button
                    className="md:hidden"
                    variant={showFilters ? 'secondary' : 'outline'}
                    onClick={() => setShowFilters((value) => !value)}
                    aria-expanded={showFilters}
                >
                    <Filter />
                    <span>Filtros</span>
                </Button>
                <div className="hidden items-center gap-2 md:flex">
                    <TypeAndStatusSelects
                        type={type}
                        setType={setType}
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
            </div>
            {showFilters && (
                <div className="grid grid-cols-2 gap-4 md:hidden">
                    <TypeAndStatusSelects
                        type={type}
                        setType={setType}
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
            )}
        </div>
    );
}
