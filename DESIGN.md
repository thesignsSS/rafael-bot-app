---
name: Proton Enterprise
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
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#515659'
  on-tertiary: '#ffffff'
  tertiary-container: '#696e71'
  on-tertiary-container: '#edf1f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
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
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 2.5rem
---

## Brand & Style

This design system is built for enterprise-grade clarity and operational efficiency. It follows a **Modern Corporate** aesthetic that prioritizes systematic organization and high legibility. The visual language is defined by a rigorous commitment to white space, a structured information hierarchy, and subtle depth through soft containerization. 

The emotional response should be one of confidence and reliability. By using a light, air-filled interface with high-contrast functional elements, the design system ensures users feel in control of complex workflows. It avoids decorative flourishes in favor of purposeful utility and a clean, balanced interface.

## Colors

The color palette is anchored by a **Vibrant Blue** primary, used strategically for primary actions and brand recognition. This is supported by a sophisticated range of **Slate Grays** that manage text hierarchy and UI boundaries.

- **Primary:** High-visibility blue for calls-to-action and active states.
- **Secondary:** Muted slate used for secondary text and icons to reduce visual noise.
- **Surface & Background:** A pure white surface for primary cards, set against a very light gray page background to create a subtle layered effect.
- **Borders:** Extremely thin, low-contrast lines are used to define regions without overwhelming the content.

## Typography

This design system uses **Inter** exclusively to ensure a systematic and utilitarian feel. The hierarchy is achieved through weight variance rather than drastic size changes.

- **Headlines:** Use Semi-Bold and Bold weights with tight letter-spacing for a modern, compact look.
- **Body:** Standardized at 14px for optimal information density in forms and tables.
- **Labels:** Use Medium weight to distinguish from body text, ensuring field labels are easily identifiable at a glance.
- **Mobile Scaling:** Large headlines scale down to `headline-lg` for mobile screens to maintain readable line-lengths.

## Layout & Spacing

The layout utilizes a **Fixed Grid** approach for desktop views to maintain focus and prevent excessively long line lengths in forms. 

- **Grid:** A 12-column grid with a 24px gutter.
- **Sidebar:** A fixed-width left navigation (240px) provides consistent context.
- **Form Layouts:** Input fields should align to 4 or 6 column spans to create structured vertical rhythm.
- **Padding:** Content containers use generous internal padding (32px) to differentiate themselves from the page background.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

1. **Floor:** The page background (#F8FAFC) acts as the base layer.
2. **Surface:** White cards (#FFFFFF) sit atop the floor with a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05)) and a 1px solid border (#E2E8F0).
3. **Elevated:** Active elements like dropdowns or modals use a medium shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to indicate focus.

Avoid heavy blacks in shadows; use tinted neutrals to keep the interface looking "airy."

## Shapes

The shape language is consistent and "Rounded," using a base radius of 8px (0.5rem). This softens the corporate edges without appearing juvenile.

- **Inputs & Buttons:** Follow the 8px base radius.
- **Cards:** Utilize a larger 12px or 16px radius for a more approachable container feel.
- **Icons:** Should be housed in circular or soft-square background tiles when used for category identification.

## Components

### Buttons
- **Primary:** Solid Primary Blue with white text. Rounded (8px). 14px Semi-Bold text.
- **Secondary/Ghost:** Primary Blue border and text with a transparent or white background.
- **Size:** Standard height is 40px; large buttons for final submissions are 48px.

### Input Fields
- **Default:** White background, 1px border (#E2E8F0), 8px radius.
- **Focus State:** Primary Blue border with a soft blue outer glow (ring).
- **Placeholder:** Light gray text (#94A3B8) in 14px Inter.

### Advanced Filters
- Advanced list filters open in a centered, elevated modal with a constrained viewport height and independently scrollable content.
- Hierarchical dimensions use dependent single selects: choosing one broker enables a client select populated only with that broker's clients. Multiple-choice dimensions use grouped checkboxes inside `surface` fieldsets; date ranges use paired native date inputs.
- Applied filters are summarized by a numeric badge on the trigger button. Active state uses `primary-fixed`, while the default trigger remains outlined.
- Within one dimension, selected values use `OR`; different dimensions use `AND`. Dependent fields, such as the end date, remain disabled until their prerequisite is filled.

### Login Announcements
- Important product or operational communications open as centered, elevated modals after an authenticated profile is available.
- Announcement artwork follows the Effectus blue, navy and white palette and scales proportionally to remain fully visible inside the constrained viewport without internal scrolling.
- Every announcement offers a top-right close icon, a secondary `Fechar` action and a primary `Não exibir mais` action. Temporary dismissal lasts for the current app visit; permanent dismissal is stored per announcement and per user in `localStorage`.

### Cards
- Used for grouping related form sections. Always white with a 1px border and the "Surface" shadow level.

### Kanban de Propostas
- Use operational columns from the backend status endpoint. The canonical order is `Em análise`, `Pendente`, `Condicionado`, `Reprovado`, `Aprovado`, `Validação de Renda`, `Renda Validada`, `Renda Não Validada`, `Engenharia`, `Formulários`, `Aguardando Reserva`, `Conformidade`, `Agendamento na Agência`, `ITBI`, `Assinatura de Contrato`, `Registro` and `Finalizado`.
- Columns use `surface-container-low` with 1px `outline-variant` border and compact internal spacing to support scanning.
- Cards use `surface-container-lowest`, 8px radius, subtle border and soft shadow. Keep metadata dense: proposal code, client, broker, property type, creation date and document count.
- Status color is functional, not decorative: primary blue for analysis, amber for pending, sky blue for conditioned, error container red for rejected and restrained green for approved. Later operational stages use distinct, restrained Tailwind tones to remain scannable without changing the shared palette tokens.
- Drag affordances only appear when the user can move cards. Read-only users should see the same board without drag handles or movement states.

### Progress Indicators
- Use horizontal steps with icons to show workflow progression, utilizing the primary blue for completed or active states.

### File Uploaders
- A dashed border container with a central icon and "drag and drop" instructions. Use a lighter tint of the primary color for the background to indicate a drop zone.
