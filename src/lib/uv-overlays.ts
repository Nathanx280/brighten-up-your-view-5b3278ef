// Stylized UV-overlay silhouettes for the most common painting targets.
// These are simplified region indicators drawn as SVG to give players a visual
// hint of where the painting will land. Coordinates are in a 0-100 viewBox so
// the overlay scales to any preview size.

export interface UvOverlay {
  /** SVG markup (without the wrapping <svg> element). */
  svg: string;
  label: string;
}

const creature = (path: string, label: string): UvOverlay => ({
  label,
  svg: `<path d="${path}" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round" />`,
});

// Suffix → overlay
export const UV_OVERLAYS: Record<string, UvOverlay> = {
  // Generic quadruped
  "_Rex_Character_BP_C": creature(
    "M10 60 L18 38 L30 30 L60 28 L72 34 L80 40 L86 50 L82 62 L70 72 L40 76 L22 72 Z M70 34 L88 28 L92 32 L86 38 M14 70 L10 82 M22 70 L18 84 M70 70 L74 84 M82 64 L88 78",
    "Rex body + tail UV"
  ),
  "_Carno_Character_BP_C": creature(
    "M14 58 L22 36 L34 30 L62 30 L74 36 L82 44 L80 58 L70 68 L34 70 L18 66 Z M16 66 L12 80 M26 68 L22 82 M68 66 L72 80 M78 56 L86 70",
    "Carno UV"
  ),
  "_Raptor_Character_BP_C": creature(
    "M12 56 L20 38 L34 34 L60 34 L70 40 L78 50 L74 60 L60 66 L30 66 L18 62 Z M62 38 L74 30 L80 34 L72 42 M16 64 L12 78 M28 64 L24 80 M62 64 L66 80",
    "Raptor UV"
  ),
  "_Sauropod_Character_BP_C": creature(
    "M8 60 L16 50 L34 48 L70 48 L82 56 L88 66 L78 74 L18 74 Z M70 48 L84 24 L92 22 L94 28 L84 50 M14 72 L10 86 M28 74 L26 88 M70 74 L72 88 M82 70 L86 84",
    "Bronto UV"
  ),
  "_Wyvern_Character_BP_Base_C": creature(
    "M50 50 L20 30 L8 38 L18 50 L8 62 L20 70 L50 50 L80 30 L92 38 L82 50 L92 62 L80 70 L50 50 M48 50 L70 60 L84 78 L78 82 L62 70",
    "Wyvern wings"
  ),
  "_Ptero_Character_BP_C": creature(
    "M50 50 L24 32 L12 36 L22 50 L12 64 L24 68 L50 50 L76 32 L88 36 L78 50 L88 64 L76 68 L50 50",
    "Pteranodon wings"
  ),
  "_Quetz_Character_BP_C": creature(
    "M50 52 L18 28 L6 32 L20 52 L6 72 L18 76 L50 52 L82 28 L94 32 L80 52 L94 72 L82 76 L50 52",
    "Quetzal wings"
  ),
  // Humans (front body)
  "_PlayerPawnTest_Female_C": creature(
    "M40 12 L60 12 L60 24 L70 30 L70 60 L62 62 L62 88 L54 88 L54 64 L46 64 L46 88 L38 88 L38 62 L30 60 L30 30 L40 24 Z",
    "Human body UV"
  ),
  "_PlayerPawnTest_Male_C": creature(
    "M38 10 L62 10 L62 24 L72 32 L72 60 L64 62 L64 90 L56 90 L56 64 L44 64 L44 90 L36 90 L36 62 L28 60 L28 32 L38 24 Z",
    "Human body UV"
  ),
};

// Generic per-category fallbacks
const GENERIC_RECT: UvOverlay = {
  label: "Paint area",
  svg: `<rect x="6" y="6" width="88" height="88" fill="none" stroke="currentColor" stroke-width="0.6" stroke-dasharray="3 2" />`,
};

const GENERIC_FLAG: UvOverlay = {
  label: "Flag area",
  svg: `<rect x="14" y="6" width="72" height="88" fill="none" stroke="currentColor" stroke-width="0.6" />
        <line x1="14" y1="20" x2="86" y2="20" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2 2" />`,
};

const GENERIC_DOOR: UvOverlay = {
  label: "Door panel",
  svg: `<rect x="22" y="8" width="56" height="84" fill="none" stroke="currentColor" stroke-width="0.6" />
        <rect x="30" y="20" width="40" height="36" fill="none" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2 2" />`,
};

export function getOverlayForTarget(suffix: string, category: string): UvOverlay | null {
  if (UV_OVERLAYS[suffix]) return UV_OVERLAYS[suffix];
  if (category === "Creatures") {
    // Generic quadruped fallback
    return creature(
      "M12 58 L22 38 L36 32 L62 32 L74 38 L82 48 L78 60 L66 68 L34 70 L18 66 Z M16 66 L12 80 M26 68 L22 82 M68 66 L72 80 M78 56 L86 70",
      "Creature body UV"
    );
  }
  if (category === "Flags & Decor") return GENERIC_FLAG;
  if (category === "Doors & Gates") return GENERIC_DOOR;
  return GENERIC_RECT;
}
