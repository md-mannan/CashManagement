import { Head, router, useForm } from '@inertiajs/react';
import { Chrome, Facebook, Github, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import AuthLayout from '@/layouts/auth-layout';
import { Separator } from '@radix-ui/react-separator';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const { showToast } = useToast();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                showToast({
                    type: 'success',
                    title: 'Account Created!',
                    message: 'Your account has been created successfully. Welcome!',
                    sound: true,
                });
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                showToast({
                    type: 'error',
                    title: 'Registration Failed',
                    message: Array.isArray(firstError) ? firstError[0] : firstError || 'Please check your information and try again.',
                    sound: true,
                });
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleSocialLogin = (provider: string) => {
        setSocialLoading(provider);
        router.visit(route('socialite.redirect', provider), {
            onFinish: () => setSocialLoading(null),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>

            {/* Social Authentication */}
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={socialLoading !== null}
                        className="flex items-center gap-2"
                    >
                        {socialLoading === 'facebook' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Facebook className="h-4 w-4 text-blue-600" />
                        )}
                        Facebook
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={socialLoading !== null}
                        className="flex items-center gap-2"
                    >
                        {socialLoading === 'google' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4 text-red-600" />}
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        disabled={socialLoading !== null}
                        className="flex items-center gap-2"
                    >
                        {socialLoading === 'github' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Github className="h-4 w-4 text-gray-800" />
                        )}
                        GitHub
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
