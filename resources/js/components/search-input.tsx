import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SearchInput({ placeholder, value, onChange, className }: SearchInputProps) {
    return (
        <div className={cn("relative flex-1 max-w-sm", className)}>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder || "Buscar..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 pl-9 text-sm"
            />
        </div>
    );
}
