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

interface UserFiltersSectionProps {
    search: string;
    setSearch: (value: string) => void;
    isPremium: string;
    setIsPremium: (value: string) => void;
}

function IsPremiumSelect({
    isPremium,
    setIsPremium,
}: Pick<UserFiltersSectionProps, 'isPremium' | 'setIsPremium'>) {
    return (
        <Select value={isPremium} onValueChange={setIsPremium}>
            <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo de Usuario" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="1">Usuarios Premium</SelectItem>
                <SelectItem value="0">Usuarios Normales</SelectItem>
            </SelectContent>
        </Select>
    );
}

export function UserFiltersSection({
    search,
    setSearch,
    isPremium,
    setIsPremium,
}: UserFiltersSectionProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <SearchInput
                    placeholder="Buscar por nombre o correo..."
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
                    <IsPremiumSelect isPremium={isPremium} setIsPremium={setIsPremium} />
                </div>
            </div>
            {showFilters && (
                <div className="md:hidden">
                    <IsPremiumSelect isPremium={isPremium} setIsPremium={setIsPremium} />
                </div>
            )}
        </div>
    );
}
