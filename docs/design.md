# Design Documentation

This document outlines the design system and UI components used in Spots, providing guidelines for consistent visual design and user experience.

## Design Philosophy

The Spots design system aims to be:

1. **Accessible** - Compliant with WCAG 2.1 AA standards
2. **Responsive** - Adapts fluidly across all device sizes
3. **Consistent** - Creates a cohesive experience across the application
4. **Performant** - Optimized for Core Web Vitals
5. **Delightful** - Incorporates subtle animations and transitions

## Component Library

Spots uses shadcn/ui (canary version) as the foundation for its component library. This provides a set of accessible, customizable components that can be easily tailored to match our design system.

The component library follows these principles:

1. Components are fully accessible and keyboard navigable
2. Components are responsive and adapt to different screen sizes
3. Components can be easily themed and customized
4. Components are lightweight and performant

### Core Components

Our core components extend shadcn/ui and include:

- **Typography** - Text components for headings, paragraphs, etc.
- **Buttons** - Primary, secondary, ghost, and other button variants
- **Forms** - Input fields, selects, checkboxes, and other form elements
- **Cards** - Various card layouts for displaying content
- **Navigation** - Headers, footers, and navigation menus
- **Modals and Dialogs** - Overlay components for focused interactions
- **Lists and Grids** - Components for displaying collections of items

## Color System

The Spots color system uses a purposeful palette that communicates brand identity while ensuring accessibility. Colors are defined using Tailwind 4's configuration.

### Primary Colors

- **Primary**: Brand's main color used for primary buttons, links, and key UI elements
  - Base: `#2563eb` (blue-600)
  - Light: `#3b82f6` (blue-500)
  - Dark: `#1d4ed8` (blue-700)

### Secondary Colors

- **Secondary**: Used for secondary actions and UI elements
  - Base: `#9333ea` (purple-600)
  - Light: `#a855f7` (purple-500)
  - Dark: `#7e22ce` (purple-700)

### Neutral Colors

- **Neutral**: Used for text, backgrounds, and UI elements
  - White: `#ffffff`
  - Black: `#000000`
  - Gray Scale: Tailwind's gray palette from 50 to 950

### Semantic Colors

- **Success**: `#10b981` (emerald-500)
- **Error**: `#ef4444` (red-500)
- **Warning**: `#f59e0b` (amber-500)
- **Info**: `#3b82f6` (blue-500)

### Color Variations

Each color has corresponding light and dark variations for use in different contexts:

```ts
// tailwind.config.js
const colors = {
  primary: {
    DEFAULT: '#2563eb',
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    DEFAULT: '#9333ea',
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  // Other color scales...
};
```

## Typography

Typography is based on a harmonious scale that ensures readability and hierarchy.

### Font Families

- **Primary Font**: Inter, a modern sans-serif font
- **Secondary Font**: Playfair Display, used for headings and accents

### Type Scale

The type scale follows a ratio to create a consistent hierarchy:

- Display: 4.5rem (72px)
- H1: 3rem (48px)
- H2: 2.25rem (36px)
- H3: 1.75rem (28px)
- H4: 1.5rem (24px)
- H5: 1.25rem (20px)
- H6: 1rem (16px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- XSmall: 0.75rem (12px)

### Line Heights

- Tight: 1.2
- Normal: 1.5
- Relaxed: 1.75

### Font Weights

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Typography Components

Tailwind 4 is used for typography, along with custom components for specific needs:

```tsx
// components/ui/typography.tsx
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'xs';
  as?: keyof JSX.IntrinsicElements;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Text({
  variant = 'body',
  as: Component = 'p',
  weight = 'regular',
  className,
  children,
  ...props
}: TextProps) {
  const variantClasses = {
    h1: 'text-4xl sm:text-5xl font-bold tracking-tight',
    h2: 'text-3xl sm:text-4xl font-bold tracking-tight',
    h3: 'text-2xl sm:text-3xl font-semibold',
    h4: 'text-xl sm:text-2xl font-semibold',
    h5: 'text-lg sm:text-xl font-medium',
    h6: 'text-base sm:text-lg font-medium',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  };

  const weightClasses = {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={cn(variantClasses[variant], weightClasses[weight], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
```

## Spacing

The spacing system uses Tailwind 4's built-in spacing scale, which follows a pattern that provides more precision at smaller values and more increment at larger values.

Spacing is used consistently throughout the interface for margins, padding, and layout.

## Iconography

Spots uses a curated set of icons from [Lucide](https://lucide.dev), which are:

- Simple and clear
- Consistent in style
- Optimized as SVGs
- Available in multiple sizes
- Customizable in color and weight

Icons are implemented as React components:

```tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends React.SVGAttributes<SVGElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Icon({ icon: LucideIcon, size = 'md', className, ...props }: IconProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  return <LucideIcon className={cn(sizeClasses[size], className)} {...props} />;
}
```

## Shadows and Elevation

Shadows are used to convey elevation and hierarchy in the interface:

```ts
// tailwind.config.js
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};
```

## Border Radius

Border radius is used consistently to create a cohesive look:

```ts
// tailwind.config.js
const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};
```

## Animation and Motion

Animations are used purposefully to enhance user experience:

- **Micro-interactions**: Subtle feedback for user actions
- **Transitions**: Smooth transitions between states
- **Loading States**: Visual feedback during loading
- **Page Transitions**: Smooth transitions between pages

Animations are implemented using Tailwind 4's animation utilities and CSS transitions:

```tsx
// Button animation example
<button className="transition-all duration-200 hover:scale-105 active:scale-95">
  Click Me
</button>
```

## Dark Mode

Spots supports both light and dark modes using Tailwind 4's dark mode utilities. The dark mode is designed to be comfortable for use in low-light environments while maintaining accessibility.

Dark mode can be toggled manually or set to follow the user's system preference.

## Component Examples

### Button Component

```tsx
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Card Component

```tsx
// components/ui/card.tsx
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-card text-card-foreground',
      bordered: 'bg-card text-card-foreground border border-border',
      elevated: 'bg-card text-card-foreground shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

## Responsive Design

Spots is designed to be fully responsive across all device sizes. We use Tailwind 4's responsive utilities to create a fluid experience:

- **Mobile-first approach**: Design for mobile and enhance for larger screens
- **Fluid typography**: Text scales appropriately across screen sizes
- **Flexible layouts**: Using grid and flexbox for adaptive layouts
- **Responsive components**: Components adapt to their container size

### Breakpoints

We use the following breakpoints:

- `sm`: 640px (Mobile landscape/small tablets)
- `md`: 768px (Tablets)
- `lg`: 1024px (Desktops)
- `xl`: 1280px (Large desktops)
- `2xl`: 1536px (Extra large screens)

## Accessibility

Accessibility is a core principle of our design system. All components are built with accessibility in mind:

1. **Proper semantics**: Using the right HTML elements
2. **Keyboard navigation**: All interactive elements are keyboard accessible
3. **Screen reader support**: ARIA attributes and proper labeling
4. **Color contrast**: WCAG 2.1 AA compliant contrast ratios
5. **Focus management**: Visible focus indicators
6. **Reduced motion**: Respecting user preferences for reduced motion

## Illustrations and Images

Consistent imagery style:

- **Illustration style**: Minimalist with consistent stroke weight
- **Photography**: Natural, authentic, and diverse
- **Image ratios**: Consistent aspect ratios (16:9, 4:3, 1:1)
- **Image treatments**: Consistent overlay treatment for text readability

## Maps and Geospatial UI

Since Spots is a location-focused application, special consideration is given to map UI:

- **Map markers**: Distinctive and accessible markers
- **Info windows**: Clean, simple info windows with key information
- **Map controls**: Intuitive controls for zoom and pan
- **Attribution**: Proper attribution for map data

Example map component:

```tsx
// components/maps/MapView.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    type?: string;
  }>;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export function MapView({
  center,
  zoom = 13,
  markers = [],
  className,
  onMarkerClick,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markerRefs = useRef<{ [id: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstance.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  // Add markers to map
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getMarkerColor(marker.type);
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.setAttribute('aria-label', marker.title);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${marker.title}</h3>`))
        .addTo(map);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(marker.id));
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onMarkerClick(marker.id);
          }
        });
      }

      markerRefs.current[marker.id] = mapboxMarker;
    });
  }, [map, markers, onMarkerClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className={cn('w-full h-80 rounded-lg', className)}
      aria-label="Interactive map"
    />
  );
}

function getMarkerColor(type?: string): string {
  switch (type) {
    case 'restaurant':
      return '#ef4444'; // red-500
    case 'cafe':
      return '#f59e0b'; // amber-500
    case 'museum':
      return '#3b82f6'; // blue-500
    default:
      return '#8b5cf6'; // violet-500
  }
}
```

## Best Practices

- **Consistency**: Use established patterns and components
- **Simplicity**: Keep designs simple and focused
- **Feedback**: Provide clear feedback for user actions
- **Hierarchy**: Use visual hierarchy to guide users
- **Whitespace**: Use whitespace to create balance and focus
- **Contrast**: Ensure sufficient contrast for readability
- **Typography**: Use type scale to establish hierarchy
- **Color**: Use color purposefully and accessibly

## Design Files and Resources

Design resources are available in Figma:

- Component Library: [Figma Link]
- Design System: [Figma Link]
- Page Templates: [Figma Link]
- Wireframes: [Figma Link]

## Version History

- v1.0 - Initial design system
- v2.0 - Updated to support shadcn/ui
- v3.0 - Upgraded to Tailwind 4 with enhanced color system
- v3.1 - Added support for dark mode
- v4.0 - Current version with shadcn@canary and enhanced components