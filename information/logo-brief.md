# Logo Prompt — Leafnote

> Prompt thiết kế logo cho Leafnote. Copy trực tiếp hoặc chỉnh sửa để dùng với AI/designer.

---

## Prompt chính

Design a minimal, flat logo icon for "Leafnote" — a smart note-taking web app.

The logo is a **single slim leaf tilted at ~45 degrees**, whose stem tapers down to a sharp writing point with a thin ink trail curving away from it.

Shape:

- A **slim, elongated leaf** — narrow and elegant, similar proportions to a willow leaf or a quill feather. Width-to-height ratio roughly 1:3 or 1:4. NOT a wide round leaf
- The leaf has **soft, organic curves** — edges gently wavy and slightly asymmetric, like a real leaf. A subtle S-curve along the length to feel dynamic and alive
- The leaf is **one solid continuous shape** — NOT split down the middle, no white cuts through it. It may have 1–2 hair-thin veins (white, ~30% opacity) but the surface is unbroken
- Tilted at ~45 degrees, pointing from bottom-left to upper-right (like a hand holding a pen to write)
- The **bottom of the leaf stem simply tapers to a sharp point** — just the stem getting thinner and thinner until it ends in a fine tip. NO pen nib shape, NO fountain pen, NO triangle, NO mechanical parts, NO ring or collar. Imagine cutting the stem at an angle with scissors — just a clean sharp end
- From this sharp point, a **single thin curved line** trails away to the right — like an ink stroke left by writing. Very thin, graceful, tapering out to nothing

CRITICAL — what NOT to do:

- Do NOT draw any pen nib, fountain pen tip, or calligraphy nib shape — the stem just ends in a sharp point naturally
- Do NOT add a circle, dot, hole, ring, band, or any mechanical detail at the bottom
- Do NOT split the leaf in half like feather barbs
- Do NOT add thick white lines or cuts through the leaf
- Do NOT make the leaf wide and round — keep it slim and elongated

Color:

- Leaf: **emerald-to-teal gradient** (`#10B981` → `#14B8A6`), vivid, flowing from leaf tip down to the sharp point
- Sharp point and ink trail: darker emerald (`#047857`)
- Veins (if any): white at ~30% opacity, hair-thin
- No colors outside the emerald–teal range

Style:

- **Flat design, vector style, minimal** — no 3D, no realistic textures, no heavy shadows
- Slim, elegant, scholarly — like a calligraphy stroke frozen mid-air
- NOT an eco/environment/agriculture logo — this is a knowledge/writing tool
- Must remain recognizable at **16×16px** (favicon size) — the slim leaf silhouette should read clearly
- Should look good inside a **rounded square container** (border-radius 12px)
- **Square aspect ratio** (1:1) for the icon

Do NOT include any text in the icon. Icon only.

---

## Prompt fix gradient (gửi kèm ảnh gốc)

Look at the attached image. This is our current logo. The shape, layout, composition, proportions, and ink trail are exactly what we want — do NOT change any of these.

The ONLY problem is the **gradient quality on the leaf surface**. Fix the following issues:

1. **Banding / color stepping**: The gradient is not smooth — it shows visible color bands (distinct stripes of color instead of a continuous blend). Especially in the mid-body of the leaf, the upper-right edge, and near the stem. Remove all banding — the gradient must be perfectly smooth, like an airbrush.

2. **Inconsistent gradient direction**: The light-to-dark flow is broken in some areas. Some patches appear lighter or darker than their surrounding area, creating a "dirty" or noisy look. The gradient should flow in ONE consistent direction: from the leaf tip (lighter, `#14B8A6` teal) smoothly down to the stem (darker, `#047857` deep emerald). No random bright or dark patches.

3. **Saturation jumps**: Some areas are oversaturated cyan/green while adjacent areas are suddenly dull/desaturated. This makes the leaf look "muddy". The saturation should be even and consistent across the entire leaf surface.

What the fixed version should look like:
- **Perfectly smooth gradient** — zero visible color steps or bands
- **One clean directional flow** — lighter teal at the top tip, gradually deepening to dark emerald at the stem, no interruptions
- **Even saturation** — no random bright or dull patches
- **Clean vector feel** — like it was made in Illustrator with a simple 2-stop linear gradient
- **No texture, no noise, no compression artifacts**

Keep EVERYTHING else identical: the leaf shape, the curves, the veins, the sharp point, the ink trail, the tilt angle, the overall size and position. Only fix the gradient.

---

## Prompt cho full logo (icon + wordmark)

Same icon as above, placed to the left of the wordmark:

- Wordmark: "Leafnote" in **Cormorant Garamond** (serif), semi-bold, dark gray (`#18181B`)
- Below the wordmark in small uppercase letters with wide tracking: "GHI CHU CO VONG DOI" in **Inter** (sans-serif), light gray (`#A1A1AA`)
- Icon-to-wordmark width ratio: approximately **1:3**
- Clean white background (`#F7F9F7`)

---

## Prompt cho dark mode version

Same logo, but on a near-black background (`#08080D`):

- Wordmark color changes to off-white (`#F4F4F5`)
- Tagline color changes to medium gray (`#71717A`)
- Icon gradient stays the same or slightly more vivid to pop against dark background

---

## Prompt cho monochrome version

Same icon, but rendered in:

- **All black** on white background (for print, watermark)
- **All white** on black background (for dark overlays)
- No gradient — use solid fill with opacity layers for the stacked leaves

---

## Variations to explore

1. **Fan direction:** Try fanning the leaves to the right, to the top-right, or in a slight arc
2. **Line count:** Try 2 lines vs 3 lines inside each leaf — fewer is cleaner at small sizes
3. **Stem visibility:** Try with and without a small stem/cuống on each leaf
4. **Overlap amount:** Try tight overlap (cards barely separated) vs loose spread (clearly 3 distinct pieces)
5. **Front leaf accent:** Try making only the front leaf have the full gradient, with back leaves as outlines or ghost shapes

---

## Context (cho designer đọc thêm nếu cần)

**Leafnote** is a smart note-taking app. Its core concept: when a user writes a note, AI automatically **decomposes it into small knowledge units called "leaves"**. Each leaf has its own lifecycle — the system tracks how well the user remembers each leaf and resurfaces it at the right moment.

The logo must convey:

1. **Leaf** — the fundamental unit of knowledge
2. **Note/writing** — the sharp point + ink trail = writing
3. **Organic, not techy** — feels natural and scholarly, not cold or robotic

Target users: university students, researchers, self-learners.

App palette: emerald green (`#10B981`), teal (`#14B8A6`), deep emerald (`#047857`). Backgrounds: light (`#F7F9F7`), dark (`#08080D`). Text: near-black (`#18181B`) on light, near-white (`#F4F4F5`) on dark.

The icon will appear at:

- 36×36px in the app sidebar (next to wordmark)
- 16×16px and 32×32px as favicon
- 192×192px and 512×512px as PWA icon
- Large size on login/splash screen with a gentle floating animation
