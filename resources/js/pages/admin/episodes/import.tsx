import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save, HelpCircle, Layers, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEpisodeImport } from '@/hooks/use-episode-import';

export default function EpisodeImport({
    anime,
    servers,
}: {
    anime: any;
    servers: any[];
}) {
    const { 
        data, 
        setData, 
        parsedPlayers, 
        canImport,
        processing, 
        errors, 
        submit 
    } = useEpisodeImport(anime.id, servers);

    return (
        <>
            <Head title={`Importar: ${anime.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader 
                    title={
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                <Link href={`/admin/animes/${anime.id}/episodes`}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                            <span>Importador Inteligente: {anime.name}</span>
                        </div>
                    }
                    subtitle="Los episodios se crearán o actualizarán automáticamente basándose en los links"
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_number">Episodio Inicial</Label>
                                    <Input
                                        id="start_number"
                                        type="number"
                                        value={data.start_number}
                                        onChange={(e) => setData('start_number', e.target.value)}
                                        placeholder="Ej: 1"
                                        className="font-bold text-primary"
                                    />
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                                        Inicio de cuenta
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="languaje">Idioma</Label>
                                    <Select 
                                        value={data.languaje} 
                                        onValueChange={(val) => setData('languaje', val)}
                                    >
                                        <SelectTrigger id="languaje" className="font-bold">
                                            <SelectValue placeholder="Idioma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Subtitulado</SelectItem>
                                            <SelectItem value="1">Latino</SelectItem>
                                            <SelectItem value="2">Castellano</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                                        Para los players
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="players">Lista de Códigos (uno por línea)</Label>
                                <Textarea
                                    id="players"
                                    value={data.players}
                                    onChange={(e) => setData('players', e.target.value)}
                                    placeholder="Pega aquí los códigos o enlaces..."
                                    className="min-h-[400px] font-mono text-sm leading-relaxed border-2 focus-visible:ring-primary/20"
                                />
                                {errors.players && <p className="text-xs text-destructive">{errors.players}</p>}
                            </div>

                            <div className="flex flex-wrap gap-3 pt-4">
                                <Button 
                                    onClick={() => submit('stay')} 
                                    disabled={processing || !canImport} 
                                    variant="secondary"
                                    className="flex-1 gap-2"
                                >
                                    <Save className="size-4" />
                                    <span>Importar y Seguir</span>
                                </Button>

                                <Button 
                                    onClick={() => submit('clear')} 
                                    disabled={processing || !canImport} 
                                    variant="outline"
                                    className="flex-1 gap-2"
                                >
                                    <RotateCcw className="size-4" />
                                    <span>Importar y Limpiar</span>
                                </Button>

                                <Button 
                                    onClick={() => submit('back')} 
                                    disabled={processing || !canImport} 
                                    className="flex-1 gap-2 shadow-lg shadow-primary/20"
                                >
                                    <ArrowLeft className="size-4" />
                                    <span>Importar y Regresar</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card shadow-sm flex flex-col h-full max-h-[650px]">
                            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Layers className="size-4 text-primary" />
                                    Vista Previa
                                </h3>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-background">{parsedPlayers.length} Links</Badge>
                                </div>
                            </div>

                            {parsedPlayers.length > 0 && (
                                <div className="p-3 bg-muted/5 border-b flex flex-wrap gap-2">
                                    {Object.entries(
                                        parsedPlayers.reduce((acc: any, curr) => {
                                            const name = curr.server?.title || 'No detectados';
                                            acc[name] = (acc[name] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([name, count]: [string, any]) => (
                                        <Badge 
                                            key={name} 
                                            variant={name === 'No detectados' ? 'destructive' : 'secondary'}
                                            className="text-[10px] px-2 py-0"
                                        >
                                            {name}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-0">
                                {parsedPlayers.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {parsedPlayers.map((item, idx) => (
                                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors gap-4">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="size-7 shrink-0 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                                        {item.number}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] font-mono truncate text-muted-foreground w-full">
                                                            {item.url}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {item.server ? (
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors font-bold text-[10px] px-2 py-0.5">
                                                            {item.server.title}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 text-[10px] px-2 py-0.5">
                                                            Desconocido
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                                        <Layers className="size-12" />
                                        <p className="text-sm">Pega algunos links para ver la previsualización</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EpisodeImport.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Administración', href: '/admin' },
            { title: 'Animes', href: '/admin/animes' },
            ...(page.props?.anime
                ? [
                      {
                          title: page.props?.anime?.name,
                          href: `/admin/animes/${page.props?.anime?.id}/episodes`,
                      },
                      { title: 'Importador Masivo', href: '#' },
                  ]
                : [{ title: 'Importador Masivo', href: '#' }]),
        ]}
    >
        {page}
    </AppLayout>
);
