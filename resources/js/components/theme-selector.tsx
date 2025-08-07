import { Theme, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Palette, Sparkles } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function ThemeSelector({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { theme, updateTheme } = useAppearance();

    const themes: { value: Theme; icon: LucideIcon; label: string; description: string }[] = [
        { 
            value: 'neutral', 
            icon: Palette, 
            label: 'Neutral', 
            description: 'Clean and minimal design' 
        },
        { 
            value: 'violet', 
            icon: Sparkles, 
            label: 'Violet', 
            description: 'Elegant purple theme' 
        },
    ];

    return (
        <div className={cn('space-y-4', className)} {...props}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {themes.map(({ value, icon: Icon, label, description }) => (
                    <button
                        key={value}
                        onClick={() => updateTheme(value)}
                        className={cn(
                            'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground',
                            theme === value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border'
                        )}
                    >
                        <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md',
                            theme === value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                        )}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
