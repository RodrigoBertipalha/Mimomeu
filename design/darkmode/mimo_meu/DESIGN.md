---
name: Mimo Meu
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c6c8bb'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#909287'
  outline-variant: '#45483f'
  surface-tint: '#becca3'
  primary: '#becda4'
  on-primary: '#293417'
  primary-container: '#a3b18a'
  on-primary-container: '#384425'
  inverse-primary: '#566342'
  secondary: '#ffb59a'
  on-secondary: '#53210c'
  secondary-container: '#723922'
  on-secondary-container: '#f5a587'
  tertiary: '#91d893'
  on-tertiary: '#003911'
  tertiary-container: '#77bc7a'
  on-tertiary-container: '#004b18'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae8be'
  primary-fixed-dim: '#becca3'
  on-primary-fixed: '#141f05'
  on-primary-fixed-variant: '#3f4b2c'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#6f3720'
  tertiary-fixed: '#abf4ac'
  tertiary-fixed-dim: '#90d792'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#07521d'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
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
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is centered on the concept of "Intimate Curation." It serves a platform where gift-giving is treated as a meaningful gesture rather than a transaction. The brand personality is sophisticated yet welcoming, blending the exclusivity of a high-end boutique with the warmth of a personal celebration.

The visual style follows a **Modern Minimalist** approach with **Glassmorphic** accents. It utilizes a deep, immersive dark mode to make the product photography (gifts) the hero. By using purposeful whitespace and a restrained color palette, the system evokes a sense of "organized simplicity," ensuring users feel calm and inspired while navigating their lists.

## Colors

The palette is designed for deep-mode comfort and premium appeal. 

- **Surface & Background:** The foundation uses a deep charcoal (`#121417`) to provide a high-contrast backdrop for content. The surface-container (`#1E2125`) creates logical grouping without the need for harsh borders.
- **Primary (Sage Green):** Used for primary actions, success states, and progress indicators. It feels organic and calm.
- **Secondary (Antique Rose):** Reserved for accents, soft highlights, and "special" categories like curated favorites or anniversaries.
- **Status Tones:** 
    - **Available:** Indicated by high-contrast primary accents.
    - **Reserved:** Uses a low-saturation, diminished opacity of the secondary color or a muted slate to indicate "unavailable" without looking "error-red."
- **Typography:** Off-white is strictly for headings and critical data; light gray is used for all descriptive text to reduce eye strain.

## Typography

The design system exclusively uses **Plus Jakarta Sans** for its modern, clean geometry and friendly terminals. 

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter spacing to create a compact, premium feel.
- **Body Text:** Maintains a generous line height (1.5x - 1.6x) to ensure legibility against the dark background.
- **Labels:** Small caps or slightly tracked-out labels are used for metadata like "Date Added" or "Store Name" to provide structural hierarchy.
- **Mobile Scaling:** For mobile, display sizes are aggressively reduced to maintain a single-column focus without excessive wrapping.

## Layout & Spacing

This design system uses a **Fluid Grid** model centered on an 8px base unit. 

- **Desktop:** A 12-column grid with 24px gutters. Content is typically contained within a max-width of 1280px to maintain readability.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** Vertical spacing follows a "stack" logic. Small groups (labels/inputs) use 8px; related sections (card content) use 24px; and major sections (header to content) use 48px or 80px to emphasize the "organized simplicity" and luxury of space.
- **Alignment:** All elements are center-aligned or left-aligned; right-alignment is reserved only for numerical data and primary action buttons in footers.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**.

1.  **Level 0 (Background):** The base `#121417` surface. 
2.  **Level 1 (Cards/Containers):** Uses `#1E2125`. These surfaces feature a very subtle 1px border of `#FFFFFF` at 5% opacity to define the edge against the dark background.
3.  **Level 2 (Overlays/Modals):** These use a soft backdrop blur (20px) to create a "frosted glass" effect, allowing the background colors to peek through slightly.
4.  **Shadows:** We avoid pitch-black shadows. Instead, we use "Deep Glows"—shadows with a large blur radius (30px+) at very low opacity (15%), occasionally tinted with the primary sage green for active elements to simulate a soft light source.

## Shapes

The shape language is "Refined Rounded."

- **Standard Elements:** Buttons, input fields, and small cards use a **8px (rounded-md)** corner radius to feel precise.
- **Large Containers:** Content cards and modal wrappers use a **16px (rounded-lg)** radius to feel softer and more welcoming.
- **Interactive Elements:** Chips and "Reserved" badges use a **Full Pill** shape to differentiate them from actionable buttons.

## Components

- **Buttons:** Primary buttons use the Sage Green background with dark text for maximum "clickability." Secondary buttons are ghost-style with the Antique Rose border.
- **Cards:** Gift cards should feature a large image area (aspect ratio 4:5) with the title in Off-White and the price/status in Light Gray. On hover, the Sage Green border becomes visible.
- **Input Fields:** Darker than the container (`#121417`), with a 1px border that glows Sage Green when focused.
- **Chips/Badges:** 
    - *Available:* Sage Green text on a 10% opacity Sage background.
    - *Reserved:* Light Gray text on a 10% opacity Gray background, with a "lock" icon.
- **Lists:** List items are separated by subtle 1px dividers (`#FFFFFF` at 5% opacity).
- **Progress Indicators:** For lists (e.g., "12/20 items bought"), use a thin Sage Green bar with a rounded track.