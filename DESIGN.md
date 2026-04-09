# Design System Specification: Editorial Precision & Tonal Depth

## 1. Overview & Creative North Star: "The Digital Atelier"

The Creative North Star for this design system is **The Digital Atelier**. Unlike traditional fintech interfaces that feel like spreadsheets, this system treats financial data as a high-end editorial experience. It moves away from the "standard" boxy grid, embracing a philosophy where digital objects aren't just placed on a screen—they are curated in a physical space.

By blending the deep, authoritative contrast of high-end lifestyle apps with the razor-sharp precision of modern neo-banking, we create an environment that feels both exclusive and effortless. We achieve this through **Intentional Asymmetry** (breaking the eye's expectation of perfect centering), **Tonal Layering** (using color steps instead of lines), and **Manrope’s** geometric confidence to guide the user through complex financial flows.

---

## 2. Colors: Obsidian & Indigo Depth

The palette is rooted in an "Obsidian-to-Zinc" spectrum. The goal is to avoid pure black-on-white harshness, opting instead for a layered approach that mimics natural light interacting with dark surfaces.

### Surface Hierarchy & The "No-Line" Rule
To achieve a premium feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts.
- **Base Layer:** Use `surface` (#131313) for the main canvas.
- **Secondary Sections:** Use `surface-container-low` (#1C1B1B) to define large content areas.
- **Interactive Islands:** Use `surface-container-high` (#2A2A2A) for elements that require user focus.

### The "Glass & Gradient" Rule
Standard flat colors feel static. To inject "soul" into the UI:
- **CTAs:** Use a subtle vertical gradient from `primary` (#C0C1FF) to `primary-container` (#8083FF).
- **Floating Overlays:** Use `surface_variant` at 60% opacity with a `24px` backdrop blur to create a "frosted obsidian" effect.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `surface` | #131313 | The foundational obsidian canvas. |
| `primary` | #C0C1FF | Electric Indigo; used for core actions and brand moments. |
| `surface-container-lowest` | #0E0E0E | Sunken elements (e.g., input wells). |
| `surface-container-highest` | #353534 | Most elevated elements (e.g., active cards). |
| `on-surface-variant` | #C7C4D7 | Muted secondary text and icons. |

---

## 3. Typography: The Editorial Voice

We use **Manrope** as our sole typeface. Its modern, semi-geometric proportions provide a "technological elegance" that bridges the gap between a luxury magazine and a precision instrument.

*   **Display (High-Contrast):** Use `display-lg` (3.5rem) for balance summaries. Tracking should be tightened (-2%) to create a tight, professional "lockup" feel.
*   **Headlines (Authority):** `headline-md` (1.75rem) should be used for section headers. Ensure significant vertical breathing room above headlines to establish hierarchy through whitespace.
*   **Body (Readability):** `body-md` (0.875rem) is the workhorse. Always use a generous line height (1.6) to prevent financial data from feeling "cramped."
*   **Labels (Precision):** `label-sm` (0.6875rem) in uppercase with +5% letter spacing should be used for non-interactive metadata or small category tags.

---

## 4. Elevation & Depth: The Stacking Principle

We move away from the "Material 2" shadow-heavy look. Instead, depth is a product of light and layering.

*   **Tonal Stacking:** Instead of a shadow, place a `surface-container-low` card on a `surface` background. The subtle 2% shift in brightness is enough for the human eye to perceive a change in plane.
*   **Ambient Shadows:** If a "Floating Action" is required, use a shadow with a `48px` blur, 0px offset, and only 6% opacity of the `on-primary` color. This creates a soft indigo glow rather than a muddy grey smudge.
*   **Hairline Fallback:** For components that must stand out against similar tones, use the **"Ghost Border"**: a 0.5px stroke using `outline-variant` (#464554) at 40% opacity. It should be felt, not seen.
*   **The Z-Axis:** Use the `xl` (1.5rem / 24px) corner radius for top-level cards and `md` (0.75rem / 12px) for nested elements like chips or internal buttons. This creates a "parent-child" visual relationship.

---

## 5. Components: Precision Primitives

### Buttons & Interaction
- **Primary:** Electric Indigo gradient. Roundedness: `full`. No border.
- **Secondary:** Surface-only. Background: `surface-container-high`. Text: `primary`.
- **Tertiary:** Transparent background. Hairline border (0.5px) using `outline-variant`.

### Cards & Lists (The "No-Divider" Mandate)
**Forbid the use of divider lines.**
- Use `12px` of vertical whitespace to separate list items. 
- Use a `surface-container-low` background on hover/active states to define the row boundary. This keeps the interface "airy" and modern.

### Input Fields
- **State:** Resting state uses `surface-container-lowest` to create a "sunken" feel.
- **Focus:** Transition the 0.5px hairline border to `primary` and add a subtle `2px` indigo outer glow.

### Signature Component: The "Luxe Glass Card"
For credit card previews or high-value balances, use a combination of:
- `surface_variant` at 40% opacity.
- `backdrop-filter: blur(20px)`.
- A 0.5px `outline` border to catch the "light" at the edges.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical margins (e.g., 24px left, 32px right) for editorial layouts to create visual interest.
- **Do** use `primary-fixed-dim` for icons to ensure they feel integrated into the dark theme, not "neon."
- **Do** prioritize "Overlapping" elements—let a card bleed off the edge or overlap a header slightly to create a sense of three-dimensional space.

### Don't
- **Don't** use pure #000000 or pure #FFFFFF. Luxury is found in the grays and off-tones in between.
- **Don't** use 1px borders. If you think you need a border, try a 4px padding increase or a subtle background shift first.
- **Don't** use standard easing. All transitions should use a custom `cubic-bezier(0.16, 1, 0.3, 1)` for a "heavy but smooth" high-end feel.