import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerIndexActionsProps {
    onCreate: () => void;
}

export function PlayerIndexActions({ onCreate }: PlayerIndexActionsProps) {
    return (
        <Button onClick={onCreate}>
            <Plus />
            <span>Nuevo Player</span>
        </Button>
    );
}
