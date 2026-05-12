import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface AnimeImportDuplicateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pendingName?: string;
    onConfirm: () => void;
}

export function AnimeImportDuplicateDialog({
    open,
    onOpenChange,
    pendingName,
    onConfirm,
}: AnimeImportDuplicateDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Importar Duplicado?</AlertDialogTitle>
                    <AlertDialogDescription>
                        El anime <span className="font-bold text-foreground">"{pendingName}"</span> ya se encuentra en tu base de datos. 
                        Si continúas, se creará una nueva entrada con un slug diferente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Sí, importar de nuevo
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
