import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.email'), {
            onSuccess: () => {
                setIsSubmitted(true);
            },
        });
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <Head title="Password Reset Link Sent" />
                <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Check Your Email</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">We've sent a password reset link to your email address.</p>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <Mail className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Reset Link Sent</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            If an account exists for {data.email}, you will receive an email with password reset instructions.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500">Didn't receive the email? Check your spam folder or try again.</p>
                                        <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                                            Try Again
                                        </Button>
                                        <Button asChild variant="ghost" className="w-full">
                                            <TextLink href={route('login')}>
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Login
                                            </TextLink>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <Head title="Forgot Password" />
            <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Mail className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Forgot your password?</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">No worries! Enter your email address and we'll send you a reset link.</p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
                            <CardDescription className="text-center">
                                Enter your email address and we'll send you a link to reset your password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {status && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{status}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>

                            <div className="text-center">
                                <TextLink href={route('login')} className="text-sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </TextLink>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}
