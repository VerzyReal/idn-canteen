---
name: IDN Canteen
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#0060ac'
  on-secondary: '#ffffff'
  secondary-container: '#64a8fe'
  on-secondary-container: '#003c70'
  tertiary: '#6d5000'
  on-tertiary: '#ffffff'
  tertiary-container: '#8b6700'
  on-tertiary-container: '#ffeed3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system powers a high-efficiency digital school canteen ecosystem tailored for students, teachers, and campus food vendors. It merges modern commercial e-commerce clarity with a friendly, energetic school-life atmosphere. The tagline *"Jajan Praktis, Istirahat Lebih Asik!"* establishes an inviting, brisk, and hassle-free dining experience during short school breaks.

### Personality & Tone
- **Youthful yet Structured:** Vibrant accent touches balanced by dependable corporate precision to build trust among parents and school administrators.
- **Fast & Accessible:** Immediate visual clarity optimized for high-volume ordering under strict break schedules.
- **Friendly & Delighted:** Engaging micro-copy in Indonesian, with crisp feedback loops for balance top-ups, order queueing, and pickup validation.

### Visual Style
A tailored hybrid of **Clean Modern E-Commerce** and **Tactile Soft Minimalism**:
- Pure, bright background canvases that elevate food photography.
- Generous corner radii (`rounded-2xl`) evoking warmth and approachable tech.
- Low-contrast structural divisions paired with soft, diffuse lighting rather than harsh structural borders.

## Colors

The palette is engineered for rapid visual parsing, prioritizing hygiene, appetite appeal, and clear checkout hierarchies.

### Palette Architecture
- **Primary Brand (`#2563EB`):** Directs the primary visual flow—main action buttons, active navigation states, order confirmation badges, and active tab highlights.
- **Secondary Blue (`#60A5FA`):** Used for supporting interaction highlights, interactive category chips, promotional borders, and subtle gradient fills.
- **Tertiary Accent Yellow (`#FBBF24`):** Represents quick-action promotions, snack highlights, discount badges, and rating stars (*Bintang Kantin*).
- **Surface Canvas (`#F8FAFC`):** Default page background maintaining a bright, sterile, modern foundation.
- **Elevated Surfaces (`#FFFFFF`):** Product cards, bottom sheets, search overlays, and modal dialogues.
- **Main Typography (`#0F172A`):** Ultra-high contrast for menu titles, price tags, and primary CTAs.
- **Muted Typography (`#64748B`):** Nutritive tags, vendor names, prep times, and placeholder text.
- **Semantic Accents:**
  - **Success Green (`#22C55E`):** Payment verification, order ready status (*Siap Diambil*), and balance credit.
  - **Soft Orange (`#FFF7ED`):** Background fill for quick snack callouts, seasonal specials, and meal prep timers.

## Typography

Typography relies on **Inter** to ensure maximum legibility at small sizes (crucial for item counters, receipts, and nutrition badges) while maintaining a confident geometric punch in headline scales.

### Hierarchy & Style Rules
- Currency values are consistently formatted in Indonesian Rupiah (`RpXX.XXX`) utilizing `label-lg` or `headline-sm` with a semi-bold weight (`600`) to stand out instantly.
- Section titles (e.g., *Menu Favorit Siswa*, *Kantin Populer Hari Ini*) utilize `headline-md` on mobile and `headline-lg` on desktop.
- Vendor names and auxiliary tags maintain low visual weight through `body-sm` using the secondary text color `#64748B`.
- All actionable copy (CTAs, Chips, Steppers) strictly adopts `label-lg` or `label-md`.

## Layout & Spacing

The layout model balances mobile-first speed (students ordering in queues or during recess) with widescreen point-of-sale and desktop dashboard utility for canteen staff.

### Layout Rhythm
- **Base Grid:** Built on an 8pt base grid with a 4pt sub-grid for precise badge and counter alignment.
- **Mobile Devices (<640px):** Single-column layout with horizontal horizontal-scroll carousels for categories and quick snacks. The main body margin is fixed at `1rem` (16px).
- **Tablet / Large Handheld (640px - 1024px):** 2-to-3 column dynamic grid with standard `1.5rem` gutters.
- **Desktop & POS Screens (>1024px):** 12-column responsive fluid grid capped at a maximum layout container width of `1280px`. Left rail for category navigation, central grid for items (3-to-4 cards per row), and right sticky sidebar for the live order tray (*Keranjang Jajan*).

### Spacing Guidelines
- Maintain `space-md` (16px) internal card padding to safeguard visual breathing room around food thumbnails.
- Use `space-xs` (4px) to `space-sm` (8px) for tightly grouped items like price tags, preparation duration badges, and review counts.

## Elevation & Depth

This system avoids heavy physical drop shadows in favor of bright, diffused ambient lighting layered over the `#F8FAFC` foundation.

### Tonal Tiers
- **Tier 0 (Canvas):** Ground level `#F8FAFC`. Houses background surfaces, section dividers, and structural gutters.
- **Tier 1 (Surface / Rest Cards):** Pure White `#FFFFFF` with an ambient shadow: `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05)`. Gives product and vendor cards clean isolation.
- **Tier 2 (Interactive Floating / Active State):** Elevates during card hover or drag: `box-shadow: 0 10px 25px -4px rgba(37, 99, 235, 0.10)`. Subtle blue tint anchors brand association.
- **Tier 3 (Overlay / Bottom Drawers / Checkout Tray):** Modals, sticky order bars, and cart summaries: `box-shadow: 0 -8px 30px 0 rgba(15, 23, 42, 0.08)`. Ensures distinct separation above scrollable content.

### Structural Boundaries
- Border treatments are strictly subtle: `1px solid rgba(226, 232, 240, 0.8)` (`slate-200`) applied to inactive inputs, non-elevated cards, and list dividers.

## Shapes

The design language centers on generous curved contours to deliver a soft, friendly, and contemporary campus feel.

### Geometric Hierarchy
- **Base Components (`rounded-2xl` / 1rem / 16px):** Primary product cards, vendor summary cards, bottom checkout sheets, promotional banners, and modal containers.
- **Interactive Controls (`rounded-xl` / 0.75rem / 12px):** Form text inputs, search fields, quantity stepper pods, and standard CTA buttons.
- **Micro Elements (`rounded-full` / Pill-shaped):** Category filter chips, stock status pills (*Tersedia*, *Habis*), nutrition tags, and notification counters.

## Components

### Buttons
- **Primary CTA:** Solid `#2563EB` background with `#FFFFFF` text. Height of 48px on mobile for generous touch targets. Rounded to `rounded-xl`. Active state transforms slightly (`scale(0.98)`).
- **Secondary / Ghost:** Soft Blue fill (`rgba(37, 99, 235, 0.08)`) with `#2563EB` text. Used for secondary actions such as *Tambah Catatan* (Add Notes) or *Lihat Semua Menu*.
- **Icon Actions (Quick Add):** Circular 36px button positioned at the bottom right of product cards. Standard state `#2563EB` with a white plus icon; transforms to a horizontal stepper once clicked.

### Product Cards
- **Structure:** White card background with `rounded-2xl` curvature, padded by `1rem`. Top section features a 4:3 ratio food image rounded to `0.75rem`.
- **Badges:** Embedded absolute badges over the image for *Halal*, *Promo Spesial* (using Soft Orange `#FFF7ED` and Accent Yellow `#FBBF24`), or *Waktu Masak* (e.g., *~5 Mnt*).
- **Content:** Item title in `label-lg`, vendor name in `body-sm`, followed by bold price presentation in `headline-sm` (`#0F172A`).

### Quantity Stepper Pod
- Compact segmented control with `#F1F5F9` background and `rounded-xl` shape.
- Features minus button, quantity text (`label-md`), and plus button to swiftly increase order counts without opening full product dialogs.

### Chips & Categories
- **Default State:** Flat `#FFFFFF` surface with `1px solid #E2E8F0` border and `body-md` text.
- **Active State:** Solid `#2563EB` with `#FFFFFF` text and subtle glow shadow.
- Pill-shaped (`rounded-full`) with a minimum height of 36px and horizontal padding of `1rem`. Accompanied by food emoji or clean line-art icons.

### Form Inputs & Search
- Background `#FFFFFF`, border `1.5px solid #E2E8F0`, rounded to `rounded-xl`. Height 48px.
- Focus state switches border to `#2563EB` with an ambient focus ring (`0 0 0 3px rgba(37, 99, 235, 0.15)`).
- Search bar includes leading search icon and micro-copy: *"Cari nasi uduk, es teh, atau camilan..."*.

### Checkout Tray (Keranjang Mengambang)
- Bottom-docked sticky container on mobile with `rounded-t-2xl` styling and Tier 3 elevation.
- Clear breakdown of total items, price in Indonesian Rupiah, and a full-width button: *"Lanjut ke Pembayaran"*.