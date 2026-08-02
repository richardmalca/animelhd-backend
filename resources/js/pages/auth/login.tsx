import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};


export default function Login({ status }: Props) {

    return (
        <>
            <Head title="Acceso" />

            <div className="w-full max-w-sm mx-auto space-y-8">
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        placeholder="admin@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full" disabled={processing}>
                                {processing ? <Spinner /> : 'Ingresar al Panel'}
                            </Button>
                        </>
                    )}
                </Form>

                {status && (
                    <div className="text-center text-xs font-medium text-primary animate-in fade-in slide-in-from-bottom-1">
                        {status}
                    </div>
                )}
            </div>
        </>
    );
}

Login.layout = {
    title: 'Panel de Administración',
    description: 'Identificación de Seguridad Requerida',
};

