import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Key, Radio, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useSettings } from '@/hooks/use-settings';

export default function SettingsPage({ settings }: { settings: any }) {
    const { data, setData, processing, errors, handleSubmit } =
        useSettings(settings);

    return (
        <div className="space-y-8 p-6">
            <Head title="Ajustes" />

            <PageHeader
                title="Configuración"
                subtitle="Gestión de integraciones y servicios externos"
            >
                <Button
                    onClick={() => handleSubmit()}
                    disabled={processing}
                    className="h-9 gap-2"
                >
                    <Save className="size-4" />
                    <span>Guardar cambios</span>
                </Button>
            </PageHeader>

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="size-4 text-primary" />
                            <CardTitle>TMDB API</CardTitle>
                        </div>
                        <CardDescription>
                            Llave de acceso para The Movie Database
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tmdb_api_key">
                                API Key (v3 auth)
                            </Label>
                            <Input
                                id="tmdb_api_key"
                                type="password"
                                placeholder="Introduce tu API Key..."
                                value={data.tmdb_api_key}
                                onChange={(e) =>
                                    setData('tmdb_api_key', e.target.value)
                                }
                            />
                            <InputError message={errors.tmdb_api_key} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="size-4 text-primary" />
                            <CardTitle>MyAnimeList</CardTitle>
                        </div>
                        <CardDescription>
                            Credenciales de MyAnimeList (MAL)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mal_client_id">Client ID</Label>
                            <Input
                                id="mal_client_id"
                                type="password"
                                placeholder="Introduce tu MAL Client ID..."
                                value={data.mal_client_id}
                                onChange={(e) =>
                                    setData('mal_client_id', e.target.value)
                                }
                            />
                            <InputError message={errors.mal_client_id} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Radio className="size-4 text-primary" />
                            <CardTitle>Plataforma</CardTitle>
                        </div>
                        <CardDescription>
                            Configuración general del ecosistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="frontend_url">
                                Dominio del Frontend
                            </Label>
                            <Input
                                id="frontend_url"
                                type="url"
                                placeholder="https://tu-sitio.com"
                                value={data.frontend_url}
                                onChange={(e) =>
                                    setData('frontend_url', e.target.value)
                                }
                            />
                            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                                Este dominio se usará para los links de
                                recuperación.
                            </p>
                            <InputError message={errors.frontend_url} />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

SettingsPage.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Ajustes', href: '#' },
        { title: 'Configuraciones', href: '/admin/settings' },
    ],
};
