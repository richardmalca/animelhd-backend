import { Head, Link, router } from '@inertiajs/react';
import { AtSign, BadgeCheck, MailWarning, RefreshCw, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Totals {
    users: number;
    valid_format: number;
    invalid_format: number;
    popular: number;
    gmail: number;
    typo: number;
    disposable: number;
    other: number;
    distinct_domains: number;
    no_mx: number | null;
}

interface Report {
    generated_at: string;
    duration_seconds: number;
    totals: Totals;
    top_domains: { domain: string; total: number; category: string }[];
    typos: { domain: string; total: number; suggestion: string }[];
    disposable: { domain: string; total: number }[];
    others: { domain: string; total: number; mx: boolean | null }[];
    invalid_samples: { id: number; email: string }[];
}

const CATEGORY_LABEL: Record<string, string> = {
    popular: 'Popular',
    typo: 'Posible error',
    disposable: 'Desechable',
    other: 'Otro',
};

const number = (value: number) => value.toLocaleString('es');

const compact = (value: number) =>
    value >= 100000 ? new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(value) : number(value);

const percent = (value: number, total: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : '0.0') + '%';

function Kpi({ icon: Icon, label, value, hint, tone }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint: string;
    tone: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                    <p className="truncate text-2xl font-bold">{value}</p>
                    <p className="truncate text-xs text-muted-foreground">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function DomainBar({ value, max }: { value: number; max: number }) {
    return (
        <div className="h-2 w-full min-w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
        </div>
    );
}

export default function EmailReport({ report }: { report: Report | null }) {
    const [refreshing, setRefreshing] = useState(false);

    const refresh = () => {
        router.post('/admin/reports/emails/refresh', {}, {
            preserveScroll: true,
            onStart: () => setRefreshing(true),
            onFinish: () => setRefreshing(false),
        });
    };

    const refreshButton = (
        <Button onClick={refresh} disabled={refreshing}>
            <RefreshCw className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Calculando…' : report ? 'Actualizar' : 'Generar reporte'}
        </Button>
    );

    if (!report) {
        return (
            <>
                <Head title="Reporte de correos" />
                <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                    <PageHeader title="Reporte de correos" subtitle="Calidad de los correos de los usuarios registrados">
                        {refreshButton}
                    </PageHeader>
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Aún no hay un reporte. Genera el primero; con más de un millón de usuarios puede tardar unos minutos.
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const { totals } = report;
    const topMax = report.top_domains[0]?.total ?? 0;

    const segments = [
        { key: 'popular', label: 'Dominios populares', value: totals.popular, color: 'bg-green-500' },
        { key: 'other', label: 'Otros dominios', value: totals.other, color: 'bg-blue-500' },
        { key: 'typo', label: 'Posibles errores', value: totals.typo, color: 'bg-amber-500' },
        { key: 'disposable', label: 'Desechables', value: totals.disposable, color: 'bg-purple-500' },
        { key: 'invalid', label: 'Formato inválido', value: totals.invalid_format, color: 'bg-red-500' },
    ];

    return (
        <>
            <Head title="Reporte de correos" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Reporte de correos"
                    subtitle={`Generado el ${new Date(report.generated_at).toLocaleString('es')} en ${report.duration_seconds} s`}
                >
                    {refreshButton}
                </PageHeader>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                    <Kpi icon={Users} label="Usuarios" value={compact(totals.users)} hint={`${number(totals.users)} · ${number(totals.distinct_domains)} dominios`} tone="bg-primary/10 text-primary" />
                    <Kpi icon={BadgeCheck} label="Formato válido" value={percent(totals.valid_format, totals.users)} hint={number(totals.valid_format)} tone="bg-green-500/10 text-green-600" />
                    <Kpi icon={AtSign} label="Gmail" value={percent(totals.gmail, totals.users)} hint={`${number(totals.gmail)} usuarios`} tone="bg-red-500/10 text-red-600" />
                    <Kpi icon={MailWarning} label="Posibles errores" value={compact(totals.typo)} hint={`${number(totals.typo)} · ${percent(totals.typo, totals.users)}`} tone="bg-amber-500/10 text-amber-600" />
                    <Kpi icon={Trash2} label="Desechables" value={compact(totals.disposable)} hint={`${number(totals.disposable)} · ${percent(totals.disposable, totals.users)}`} tone="bg-purple-500/10 text-purple-600" />
                    <Kpi icon={ShieldAlert} label="Formato inválido" value={compact(totals.invalid_format)} hint={`${number(totals.invalid_format)} · ${percent(totals.invalid_format, totals.users)}`} tone="bg-red-500/10 text-red-600" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de correos</CardTitle>
                        <CardDescription>Cómo se reparten los {number(totals.users)} usuarios según su correo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                            {segments.map((segment) => (
                                <div
                                    key={segment.key}
                                    className={segment.color}
                                    style={{ width: `${totals.users > 0 ? (segment.value / totals.users) * 100 : 0}%` }}
                                    title={`${segment.label}: ${number(segment.value)}`}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {segments.map((segment) => (
                                <div key={segment.key} className="flex items-start gap-2">
                                    <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${segment.color}`} />
                                    <div>
                                        <p className="text-sm font-medium">{segment.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {number(segment.value)} · {percent(segment.value, totals.users)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dominios principales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dominio</TableHead>
                                        <TableHead className="text-right">Usuarios</TableHead>
                                        <TableHead className="w-1/3" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.top_domains.map((row) => (
                                        <TableRow key={row.domain}>
                                            <TableCell className="font-medium">
                                                {row.domain}
                                                {row.category !== 'popular' && (
                                                    <Badge variant="secondary" className="ml-2">{CATEGORY_LABEL[row.category]}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{number(row.total)}</TableCell>
                                            <TableCell><DomainBar value={row.total} max={topMax} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Posibles errores de tipeo</CardTitle>
                            <CardDescription>Dominios parecidos a uno popular; probablemente no reciben correo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report.typos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Dominio</TableHead>
                                            <TableHead>¿Quiso decir?</TableHead>
                                            <TableHead className="text-right">Usuarios</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.typos.map((row) => (
                                            <TableRow key={row.domain}>
                                                <TableCell className="font-medium">{row.domain}</TableCell>
                                                <TableCell className="text-muted-foreground">{row.suggestion}</TableCell>
                                                <TableCell className="text-right tabular-nums">{number(row.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dominios desechables</CardTitle>
                            <CardDescription>Correos temporales que suelen dejar de funcionar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report.disposable.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Dominio</TableHead>
                                            <TableHead className="text-right">Usuarios</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.disposable.map((row) => (
                                            <TableRow key={row.domain}>
                                                <TableCell className="font-medium">{row.domain}</TableCell>
                                                <TableCell className="text-right tabular-nums">{number(row.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Otros dominios</CardTitle>
                            <CardDescription>Dominios propios o poco comunes con más usuarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dominio</TableHead>
                                        <TableHead className="text-right">Usuarios</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.others.map((row) => (
                                        <TableRow key={row.domain}>
                                            <TableCell className="font-medium">
                                                {row.domain}
                                                {row.mx === false && <Badge variant="destructive" className="ml-2">Sin correo</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{number(row.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Correos con formato inválido</CardTitle>
                        <CardDescription>Los {report.invalid_samples.length} más recientes de {number(totals.invalid_format)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {report.invalid_samples.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay correos con formato inválido.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Correo</TableHead>
                                        <TableHead className="text-right">Usuario</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.invalid_samples.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="tabular-nums text-muted-foreground">{row.id}</TableCell>
                                            <TableCell className="break-all font-medium">{row.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/users?search=${encodeURIComponent(row.email)}`}>Ver</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EmailReport.layout = {
    breadcrumbs: [
        { title: 'Administración', href: '/admin' },
        { title: 'Reporte de correos', href: '#' },
    ],
};
