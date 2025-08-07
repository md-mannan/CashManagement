# Violet Theme Guide

This application now supports multiple color themes, including a beautiful Violet theme alongside the default Neutral theme.

## Available Themes

### Neutral Theme (Default)
- Clean and minimal design
- Uses neutral grays and whites
- Perfect for professional applications

### Violet Theme
- Elegant purple color scheme
- Features beautiful violet accents
- Available in both light and dark modes

## How to Use

### Via Settings Page
1. Navigate to `/settings/appearance`
2. Choose your preferred appearance mode (Light/Dark/System)
3. Select your preferred theme (Neutral/Violet)

### Via Header Dropdown
1. Click the theme icon (Palette/Sparkles) in the header
2. Select your preferred theme from the dropdown

## Technical Implementation

### CSS Variables
The themes use CSS custom properties with OKLCH color space for better color accuracy:

```css
/* Violet Theme Light */
.theme-violet {
    --primary: oklch(0.55 0.25 280);
    --background: oklch(0.99 0.005 280);
    /* ... more variables */
}

/* Violet Theme Dark */
.theme-violet.dark {
    --primary: oklch(0.65 0.25 280);
    --background: oklch(0.12 0.02 280);
    /* ... more variables */
}
```

### JavaScript Integration
The theme system is integrated with the existing appearance system:

```typescript
// Available types
type Appearance = 'light' | 'dark' | 'system';
type Theme = 'neutral' | 'violet';

// Usage in components
const { appearance, updateAppearance, theme, updateTheme } = useAppearance();
```

### Backend Integration
The theme preference is stored in cookies and shared with the server for SSR:

```php
// HandleAppearance middleware
View::share('appearance', $request->cookie('appearance') ?? 'system');
View::share('theme', $request->cookie('theme') ?? 'neutral');
```

## Adding New Themes

To add a new theme:

1. **Add CSS Variables**: Add theme classes in `resources/css/app.css`
2. **Update TypeScript Types**: Add the new theme to the `Theme` type
3. **Update Components**: Add the new theme to theme selectors
4. **Add Icons**: Include appropriate icons for the theme

Example:
```typescript
export type Theme = 'neutral' | 'violet' | 'new-theme';
```

## Features

- ✅ Server-side rendering support
- ✅ Persistent theme preferences
- ✅ System dark mode integration
- ✅ Smooth transitions
- ✅ Accessible design
- ✅ Mobile responsive

## Browser Support

The themes use modern CSS features:
- CSS Custom Properties (CSS Variables)
- OKLCH color space
- CSS Grid and Flexbox

Supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.4+).
