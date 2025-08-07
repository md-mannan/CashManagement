import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppearance } from '@/hooks/use-appearance';
import { HTMLAttributes } from 'react';

export default function ThemePreview({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { theme, updateTheme } = useAppearance();

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Theme Preview</h2>
                    <div className="flex gap-2">
                        <Button variant={theme === 'neutral' ? 'default' : 'outline'} onClick={() => updateTheme('neutral')}>
                            Neutral
                        </Button>
                        <Button variant={theme === 'violet' ? 'default' : 'outline'} onClick={() => updateTheme('violet')}>
                            Violet
                        </Button>
                    </div>
                </div>

                <p className="text-muted-foreground">
                    Current theme: <Badge variant="secondary">{theme}</Badge>
                </p>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Primary Colors</CardTitle>
                        <CardDescription>Primary buttons and accents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button>Primary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                        </div>
                        <div className="flex gap-2">
                            <Badge>Primary Badge</Badge>
                            <Badge variant="secondary">Secondary Badge</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Elements</CardTitle>
                        <CardDescription>Inputs and form controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="Enter your email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="Enter your password" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Background Colors</CardTitle>
                        <CardDescription>Different background variations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-8 rounded border bg-background"></div>
                            <p className="text-xs text-muted-foreground">Background</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 rounded border bg-card"></div>
                            <p className="text-xs text-muted-foreground">Card Background</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 rounded bg-muted"></div>
                            <p className="text-xs text-muted-foreground">Muted Background</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Text Colors</CardTitle>
                        <CardDescription>Different text color variations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-foreground">Foreground Text</p>
                            <p className="text-muted-foreground">Muted Text</p>
                            <p className="text-primary">Primary Text</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
