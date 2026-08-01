import type { ImageMetadata } from "astro";

/**
 * Company and institution marks, resolved by filename.
 *
 * The glob means dropping a new file into src/assets/logos/ and naming
 * it in a data file is all it takes; no code change, per PRD §11. An
 * unknown or missing name resolves to null and the caller falls back to
 * a Lucide glyph in the same 40px frame.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/logos/*.{png,jpg,jpeg,webp,avif}",
  { eager: true },
);

const byFilename = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const filename = path.split("/").pop();
  if (filename) byFilename.set(filename, module.default);
}

export function logo(filename?: string): ImageMetadata | null {
  if (!filename) return null;
  return byFilename.get(filename) ?? null;
}

/**
 * Frames are light, because that is the background almost every mark
 * here was drawn for. The exception is a mark drawn in white on
 * transparency, which vanishes on a light frame and needs an ink one
 * instead.
 *
 * Note this is not a logo with a white *background* — most of them —
 * which is opaque and reads fine. Only fully transparent, light-inked
 * marks belong in this list. If a logo you drop in disappears, check
 * which of the two it is before adding it here.
 */
const LIGHT_ON_TRANSPARENT = new Set<string>([]);

export function needsDarkBacking(filename?: string): boolean {
  return Boolean(filename && LIGHT_ON_TRANSPARENT.has(filename));
}

/** Filenames referenced by data files but not yet present on disk. */
export function missingLogos(filenames: (string | undefined)[]): string[] {
  return filenames.filter((name): name is string => Boolean(name) && !byFilename.has(name!));
}
