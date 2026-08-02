import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { languageLabel } from '../language';

export function PlayerModal({
    isOpen,
    onClose,
    submit,
    data,
    setData,
    errors,
    processing,
    editingPlayer,
    isDirty,
    locked,
    servers,
    handleCodeChange,
    isInvalidDomain,
    switchToEditById,
}: {
    isOpen: boolean;
    onClose: () => void;
    submit: (e: React.FormEvent) => void;
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    editingPlayer: any;
    isDirty: boolean;
    locked: boolean;
    servers: any[];
    handleCodeChange: (val: string) => void;
    isInvalidDomain: () => boolean;
    switchToEditById: (id: number) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const currentServer = servers.find((s) => s.id.toString() === data.server_id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPlayer
                                ? `Editando · ${languageLabel(editingPlayer.languaje)} ${currentServer?.title ?? ''}`
                                : locked
                                  ? `Nuevo · ${languageLabel(data.languaje)} ${currentServer?.title ?? ''}`
                                  : 'Nuevo Player'}
                        </DialogTitle>
                    </DialogHeader>

                    {editingPlayer && (
                        <div className="mx-6 mt-4 rounded-md bg-muted px-3 py-2 text-xs">
                            <span className="text-muted-foreground">Código original: </span>
                            <code className="font-mono">{editingPlayer.code}</code>
                        </div>
                    )}

                    {(errors.server_id || errors.languaje) && (
                        <div className="mx-6 mt-4 flex flex-col gap-2 rounded-md bg-destructive/15 p-3 text-xs font-medium text-destructive">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4" />
                                <span>{errors.server_id || errors.languaje}</span>
                            </div>
                            {errors.existing_player_id && (
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-destructive underline"
                                    onClick={() => switchToEditById(Number(errors.existing_player_id))}
                                >
                                    Editar existente
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        {!locked && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="server_id">Servidor</Label>
                                    <div className="relative">
                                        <Select
                                            value={data.server_id}
                                            onValueChange={(v) => setData('server_id', v)}
                                        >
                                            <SelectTrigger id="server_id" className="w-full">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {servers.map((server) => (
                                                    <SelectItem
                                                        key={server.id}
                                                        value={server.id.toString()}
                                                    >
                                                        {server.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {data.code && (
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                                {isInvalidDomain() ? (
                                                    <AlertCircle className="size-3.5 text-destructive" />
                                                ) : (
                                                    <Check className="size-3.5 text-green-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="languaje">Idioma</Label>
                                    <Select
                                        value={data.languaje}
                                        onValueChange={(v) => setData('languaje', v)}
                                    >
                                        <SelectTrigger id="languaje" className="w-full">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Subtitulado</SelectItem>
                                            <SelectItem value="1">Latino</SelectItem>
                                            <SelectItem value="2">Castellano</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="code">Código / URL</Label>
                            <div className="relative">
                                <Input
                                    id="code"
                                    value={data.code}
                                    ref={inputRef}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    placeholder="Pega el enlace aquí"
                                    className={`pr-10 ${isInvalidDomain() && data.code ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                />
                                {data.code && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isInvalidDomain() ? (
                                            <AlertCircle className="size-4 text-destructive" />
                                        ) : (
                                            <Check className="size-4 text-green-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {data.code && isInvalidDomain() && (
                                <p className="text-[10px] text-destructive">
                                    URL no válida para el servidor seleccionado.
                                </p>
                            )}
                            {currentServer?.domains?.length > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                    Dominios válidos: {currentServer.domains.join(', ')}
                                </p>
                            )}
                            <InputError message={errors.code} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !isDirty || isInvalidDomain() || !data.code.trim()}
                        >
                            {editingPlayer ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
