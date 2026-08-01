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
 * Marks drawn in white on a transparent background, which would be
 * invisible against the warm-white frame. These get an ink backing
 * instead. Add a filename here if a newly dropped-in logo disappears.
 *
 * Note this is not the same as a logo with a white *background* (most
 * of them): those are opaque and read fine in the standard frame.
 */
const LIGHT_ON_TRANSPARENT = new Set(["Thrifty-1.png", "Name-Logo-horizonta-whitel.png"]);

export function needsDarkBacking(filename?: string): boolean {
  return Boolean(filename && LIGHT_ON_TRANSPARENT.has(filename));
}

/** Filenames referenced by data files but not yet present on disk. */
export function missingLogos(filenames: (string | undefined)[]): string[] {
  return filenames.filter((name): name is string => Boolean(name) && !byFilename.has(name!));
}
