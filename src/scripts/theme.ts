/**
 * Light and dark.
 *
 * Light is the default for everyone, whatever their device setting (a
 * decision, not an oversight: see the note at the top of tokens.css).
 * The first decision is made before paint, by the inline script in
 * BaseLayout: dark if the visitor stored it, light otherwise. This
 * module takes over from there:
 *
 * - The toggle flips the theme and remembers it. Choosing light again
 *   clears the stored choice rather than storing "light", so nothing
 *   lingers that would outlive a later change of default.
 * - Anything that cannot be themed with CSS alone (the booking embed,
 *   the section illustrations) listens for `themechange` on document.
 */
export type Theme = "light" | "dark";

const KEY = "theme";
const DEFAULT: Theme = "light";
const root = document.documentElement;

export const currentTheme = (): Theme => (root.dataset.theme === "dark" ? "dark" : "light");

function remember(theme: Theme): void {
  try {
    if (theme === DEFAULT) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still works for this page.
  }
}

function label(theme: Theme): void {
  const next = theme === "dark" ? "light" : "dark";
  for (const button of document.querySelectorAll<HTMLElement>("[data-theme-toggle]")) {
    button.setAttribute("aria-label", `Switch to ${next} mode`);
    button.title = `Switch to ${next} mode`;
  }
}

function apply(theme: Theme): void {
  if (theme === currentTheme()) return;

  /*
   * Without this every colour transition on the page runs at once, and
   * the switch smears across a quarter of a second instead of landing.
   */
  root.setAttribute("data-theme-switching", "");
  root.dataset.theme = theme;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const color = meta?.dataset[theme];
  if (meta && color) meta.content = color;

  label(theme);
  document.dispatchEvent(new CustomEvent<Theme>("themechange", { detail: theme }));

  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
  );
}

label(currentTheme());

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.closest("[data-theme-toggle]")) return;
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  remember(next);
  apply(next);
});
