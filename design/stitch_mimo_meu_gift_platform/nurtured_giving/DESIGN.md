---
name: Nurtured Giving
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c19'
  on-surface-variant: '#444840'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#74786f'
  outline-variant: '#c4c8bd'
  surface-tint: '#506447'
  primary: '#506447'
  on-primary: '#ffffff'
  primary-container: '#8da382'
  on-primary-container: '#263920'
  inverse-primary: '#b6cdaa'
  secondary: '#705a49'
  on-secondary: '#ffffff'
  secondary-container: '#fbddc7'
  on-secondary-container: '#76604e'
  tertiary: '#795463'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc91a2'
  on-tertiary-container: '#4a2b39'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2eac5'
  primary-fixed-dim: '#b6cdaa'
  on-primary-fixed: '#0e2009'
  on-primary-fixed-variant: '#394c31'
  secondary-fixed: '#fbddc7'
  secondary-fixed-dim: '#ddc1ac'
  on-secondary-fixed: '#27180b'
  on-secondary-fixed-variant: '#564333'
  tertiary-fixed: '#ffd8e6'
  tertiary-fixed-dim: '#e8bacc'
  on-tertiary-fixed: '#2e1220'
  on-tertiary-fixed-variant: '#5f3d4b'
  background: '#fbf9f5'
  on-background: '#1b1c19'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality is nurturing, intentional, and effortlessly organized. It is designed to evoke the warmth of a thoughtful gift and the relief of a stress-free planning experience. The target audience includes modern families, couples, and event organizers who value quality and simplicity over clutter.

This design system utilizes a **Modern Minimalist** style with **Tactile** undertones. By combining heavy whitespace with organic, soft-edged UI elements, the interface feels light and breathable. The "clean and organized" requirement is met through a strict adherence to alignment and a hierarchy that prioritizes content—the gifts themselves—above the chrome of the application.

## Colors

The palette is rooted in nature and comfort. 
- **Primary (Sage Green):** Used for primary actions, success states, and brand-defining moments. It represents growth and calm.
- **Secondary (Light Brown/Taupe):** Used for accents, secondary buttons, and subtle structural elements. It provides an earthy, grounded contrast to the green.
- **Background (Cream/Beige):** Replaces harsh whites to create a "paper-like" warmth that reduces eye strain and feels more premium and inviting.
- **Neutral (Deep Charcoal/Brown):** Text is not pure black, but a very dark brown-tinted grey to maintain the soft visual harmony.

## Typography

The typography system pairs two geometric sans-serifs with different personalities. **Plus Jakarta Sans** is used for headings; its friendly, wide apertures and modern curves feel optimistic and welcoming. **Outfit** is used for body copy and labels; it is exceptionally clean and legible at smaller sizes, ensuring that gift descriptions and form labels remain accessible.

For mobile, headlines scale down to ensure no more than three words occupy a single line on standard portrait devices. Use tight tracking on large displays to maintain a "high-end editorial" feel.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed maximum widths for desktop (1280px) to prevent content stretching. 
- **Desktop:** 12-column grid, 24px gutters, 48px+ side margins.
- **Tablet:** 8-column grid, 16px gutters, 32px side margins.
- **Mobile:** 4-column grid, 16px gutters, 20px side margins.

The spacing rhythm is based on an 8px baseline. Use generous padding inside cards (24px - 32px) to emphasize the "organized" and "light" feel. Vertical rhythm should prioritize large "air gaps" between sections (e.g., 80px) to signify clear transitions in content.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Soft Ambient Shadows**. 
- **Level 0 (Background):** The Cream/Beige surface.
- **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a very soft, diffused shadow. Shadows should use the secondary taupe color rather than black, with a high blur (20px-40px) and low opacity (8-10%) to look "atmospheric" rather than heavy.
- **Level 2 (Interactive/Floating):** Used for active dropdowns or modals. These feature a slightly more defined shadow to pull them closer to the user.

Avoid harsh borders. Instead, let the subtle shift from the cream background to the white card define the boundaries.

## Shapes

The shape language is consistently **Rounded** (Level 2). This radius strikes a balance between professional geometry and friendly approachability. 
- **Buttons and Inputs:** Use a 0.5rem (8px) radius.
- **Cards:** Use a 1rem (16px) radius to feel like a physical "gift box."
- **Chips/Badges:** Use fully pill-shaped (round) corners to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons use the Sage Green background with white text. Secondary buttons use a Light Brown outline or a subtle taupe-tinted background. All buttons should have a minimum height of 48px to ensure touch-friendliness.

### Cards
The centerpiece of the platform. Cards are white with a 16px corner radius. Padding must be generous (24px). Image containers within cards should have a slightly smaller radius (12px) to create a nested, cohesive look.

### Input Fields
Inputs use a white background with a very thin (1px) light brown border. On focus, the border transitions to sage green with a soft green outer glow (2px). Labels should always be visible above the field in a bold `label-md` style for accessibility.

### Chips & Progress Indicators
Used for "Reserved" or "Purchased" statuses. Use the Sage Green for positive states and the Light Brown for neutral/pending states. Use a 50% opacity of the color for the background and 100% for the text to maintain a soft look.

### Gift Progress Bar
A unique component for group gifting. Use a thick (12px) rounded bar with a cream track and a sage green fill to show how close a gift is to being funded.