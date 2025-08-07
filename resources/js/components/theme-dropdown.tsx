import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Theme, useAppearance } from '@/hooks/use-appearance';
import { Palette, Sparkles } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function ThemeDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { theme, updateTheme } = useAppearance();

    const getCurrentIcon = () => {
        switch (theme) {
            case 'violet':
                return <Sparkles className="h-5 w-5" />;
            default:
                return <Palette className="h-5 w-5" />;
        }
    };

    const themes: { value: Theme; icon: any; label: string }[] = [
        { value: 'neutral', icon: Palette, label: 'Neutral' },
        { value: 'violet', icon: Sparkles, label: 'Violet' },
    ];

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                        {getCurrentIcon()}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {themes.map(({ value, icon: Icon, label }) => (
                        <DropdownMenuItem key={value} onClick={() => updateTheme(value)}>
                            <span className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {label}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
