---
name: Tactical Field Telemetry
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e3fdff'
  on-primary: '#00373a'
  primary-container: '#00f3ff'
  on-primary-container: '#006b71'
  inverse-primary: '#00696f'
  secondary: '#ffb3b2'
  on-secondary: '#680013'
  secondary-container: '#ff525e'
  on-secondary-container: '#5b0010'
  tertiary: '#e6ffe6'
  on-tertiary: '#003919'
  tertiary-container: '#00fc86'
  on-tertiary-container: '#006f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b2'
  on-secondary-fixed: '#410008'
  on-secondary-fixed-variant: '#92001f'
  tertiary-fixed: '#60ff99'
  tertiary-fixed-dim: '#00e479'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: 0.08em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.06em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.04em
  title-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.03em
  body-lg:
    fontFamily: Chivo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Chivo
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Chivo
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-mono-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.12em
  label-mono-md:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.14em
  label-mono-sm:
    fontFamily: Space Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.18em
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-stakes, mission-critical tactical HUD interface bridging rugged field conservation with advanced cybernetic reconnaissance. Built for command specialists managing acute wildlife crises, the visual tone merges technical precision, immediate urgency, and uncompromising clarity.

The aesthetic fuses **Tactical Sci-Fi HUD** and **Technical Glassmorphism**:
- **Tactical Field Rigidity**: Angular architecture, precision reticles, telemetry readouts, cut corners (chamfers), and hardware status indicators.
- **Holographic Depth**: Translucent obsidian surfaces, sharp luminescent borders, subtle CRT scanlines, and optical lens flares.
- **Mission Hierarchy**: High-contrast state-driven color encoding where green communicates stable biosignals, cyan indicates live geospatial tracking, amber marks anomalous sector telemetry, and crimson demands immediate emergency intervention.

## Colors

The color palette operates on a high-contrast dark spectrum designed for low-light command modules and direct optical feeds.

### Functional Roles
- **Obsidian Dark (Canvas & Backplates)**: `#06090e` grounds the entire interface, while `#0a0f18` serves as elevated surface containers. Panels use a calibrated glass wash (`rgba(10, 20, 32, 0.78)`).
- **Tactical Cyan (`#00f3ff`)**: Primary interactive and telemetry accent. Signifies active coordinate grids, reticle locks, synthetic optic feeds, and nominal digital operations.
- **Alert Crimson (`#ff1e44`)**: Primary emergency signal. Reserved for lethal threats, critical fauna vitals, perimeter breaches, and hard system overrides.
- **Bio-Safe Emerald (`#00ff88`)**: Tertiary vitals signal. Encodes stable bio-signatures, successful containment protocols, and secure extraction corridors.
- **Telemetry Amber (`#ffaa00`)**: Cautionary warning. Encodes anomalous sensor noise, proximity warnings, and degrading structural or thermal integrity.
- **Neutral Structure (`#213247`, `#506882`, `#d4e4f7`)**: Borders, tick marks, inactive status arrays, and technical metadata.

## Typography

Typography delivers machine-readout precision combined with high-stress human scanability:
- **Headlines (`Space Grotesk`)**: Geometric, assertive, and technically proportioned. Display headers are styled in uppercase with tracking to mimic cinematic heads-up readouts.
- **Body (`Chivo`)**: High-contrast, sharp modernist sans-serif engineered for field log legibility against dark translucent backing.
- **Labels & Telemetry (`Space Mono`)**: Dedicated fixed-width font for coordinates, GPS stamps, millisecond timers, vitals tracking, and raw telemetry data. Render all tactical labels in uppercase.

## Layout & Spacing

The layout is structured around an ultra-dense, multi-screen tactical dashboard utilizing a 12-column fluid matrix enclosed by cinematic HUD framing.

### Structural Framework
- **Desktop (1440px+)**: 12 columns, 1.5rem gutters, 2.5rem outer canvas margin. Features outer tactical brackets (`border-corner` brackets) and persistent top/bottom letterboxed telemetry tickers.
- **Tablet (768px - 1439px)**: 8 columns, 1.25rem gutters, 1.5rem outer margin. Peripheral HUD monitors collapse into collapsible dock draw panels.
- **Mobile (< 768px)**: 4 columns, 1rem gutters, 1rem margins. Switches to a single-column tactical feed with quick-switch bottom status segments for map, vitals, radar, and communications.
- **Letterboxing**: Desktop simulations maintain visual 16:9 or 21:9 focal bounding boxes with dark 32px letterboxing bands housing timestamp clocks, audio channel meters, and network latency indicators.

## Elevation & Depth

Visual hierarchy does not use standard dropshadows. Depth is generated through **optical luminance**, **chromatic borders**, and **frosted translucent shielding**:

- **Ground Level (Map/Field Feed)**: Deepest z-index. Base satellite video feeds or raw synthetic contour topology with 15% opacity CRT scanline rasterization.
- **Level 1 (Telemetry Panels)**: `rgba(10, 20, 32, 0.78)` background with `backdrop-filter: blur(16px)` and a `1px` structural outline in `rgba(33, 50, 71, 0.7)`.
- **Level 2 (Active Target / Alert Modules)**: `rgba(14, 26, 42, 0.88)` with razor-sharp `1px` neon laser borders (`#00f3ff` or `#ff1e44`) accompanied by an outer `0 0 12px` chromatic glow at 35% opacity.
- **Level 3 (Modal Overlays / Reticles)**: Zero surface background blur; sharp holographic vector graphics directly projected over the canvas with additive blending (`mix-blend-mode: screen`).

## Shapes

The interface is completely non-rounded (`0px` border-radius) to reflect rugged hardware, ballistic screens, and military cybernetics.

- **Chamfered Geometries**: Primary panels and active buttons utilize 45-degree angled clipped corners (via CSS `clip-path: polygon(...)`) ranging between 4px and 12px cut depth.
- **Reticle Indicators**: Crosshairs, coordinate brackets (`[` and `]`), and target acquisition pins frame corners instead of standard bounding boxes.
- **Dividers**: Stepped or notched linear dividers with integrated tick marks indicating scale or division.

## Components

### Buttons & Trigger Controls
- **Primary Action (Tactical)**: Background filled with Tactical Cyan (`#00f3ff`), text in Obsidian (`#06090e`) set in `Space Mono` bold uppercase. Clipped top-right and bottom-left corners (6px). Hover induces an intensified cyan laser glow (`0 0 18px rgba(0, 243, 255, 0.6)`).
- **Emergency Action**: Background filled with Alert Crimson (`#ff1e44`), flashing pulse animation on active triage status. Chamfered edges.
- **Ghost/Tactical Outline**: Transparent background, `1px solid rgba(0, 243, 255, 0.4)`, text in white or cyan. On hover, background fills to `rgba(0, 243, 255, 0.12)` with solid cyan border.

### Telemetry Cards & Panels
- **HUD Glass Containers**: Built with semi-transparent obsidian backdrops (`rgba(10, 20, 32, 0.75)`), backdrop blur, and 1px crisp borders.
- **Panel Header**: Accompanied by a left-aligned sub-pixel index marker (e.g., `// SEC-04 // BIOMETRICS`), micro dot-matrix patterns, and upper-right status indicator dots.
- **Corner Brackets**: Corner markers (`4px x 4px` L-shaped angles) positioned at the container vertices.

### Data Chips & Status Badges
- **Format**: Pill shapes are prohibited. Chips are sharp micro-rectangles with monospace code tags.
- **States**:
  - `STABLE`: Emerald Green border (`#00ff88`), dark emerald background fill (`rgba(0, 255, 136, 0.12)`), text `#00ff88`.
  - `WARNING`: Amber border (`#ffaa00`), background `rgba(255, 170, 0, 0.12)`, text `#ffaa00`.
  - `CRITICAL`: Crimson border (`#ff1e44`), background `rgba(255, 30, 68, 0.15)`, text `#ff1e44` with intermittent warning pulse.

### Inputs & Sensor Sliders
- **Text Inputs**: Flat obsidian field, bottom-border-only emphasis with a 2px Tactical Cyan focus underline and uppercase placeholder text. Accompanying monospace prefix (e.g., `S•–N˜
K‚‹H
ŠÚXÚØ›Þ\È	ˆÙÙÛ\ÊŠŽˆX[[Û™ÜˆÚ\œÜ]X\™H[™XØ]ÜœËˆÚ[ˆÚXÚÙYš[YÚ]ÞX[ˆÜ›ÜÜÚZ\ˆ™]XÛH

Ø
K‚‚ˆÈÈÈÜXÚX[^™YÛXZ[ˆÛÛ\Û™[Â‹H
Š•š][[[Y]žHØ]™Y›Ü›JŠŽˆÜØÚ[ÜØÛÜH[Ûš]ÜˆÜ˜\™[™\™YÚ][˜[ZXÈÕ‘È]È[ˆÌ™ŽÜˆÙ™ŒYMÝ™\ˆ[ˆ[X™\ˆÜšYX]š^‚‹H
Š•\™Ù][™È™]XÛJŠŽˆ›Ø][™ÈQ[[Y[™X]\š[™È[˜[ZXÈÛÛ˜Ù[šXÈ\™Ù][™ÈÚ\˜Û\Ë˜[™ÙHX\šÙ\œË^š[]]YÜ™Y\Ë[™[ˆ[›™\ˆØÚÙYÜ›ÜÜÚZ\‹‚‹H
Š”ØØ[›[™HÝ™\›^JŠŽˆÛØ˜[ÔÔÈÙ]YËY[[Y[\Z[™ÈH™\X][™È[™HÝ™\›^H
™\X][™Ë[[™X\‹YÜ˜YY[
YË˜[œÜ\™[˜[œÜ\™[œ™Ø˜JŒÊHÜ
X
HÈ›ÝšYHÔ•ÜXÜË