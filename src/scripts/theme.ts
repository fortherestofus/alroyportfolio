/**
 * Light and dark.
 *
 * The first decision is made before paint, by the inline script in
 * BaseLayout: a stored choice if there is one, otherwise the device
 * setting. This module takes over from there:
 *
 * - The toggle flips the theme and remembers it. If the new theme is the
 *   same as the device setting, the stored choice is cleared instead, so
 *   the site goes back to following the device. Nobody gets stuck on a
 *   choice they made once.
 * - With nothing stored, a change to the device setting (an automatic
 *   evening switch, say) is followed live.
 * - Anything that cannot be themed with CSS alone (the booking embed,
 *   the section illustrations) listens for `themechange` on document.
 */
export type Theme = "light" | "dark";

const KEY = "theme";
const root = document.documentElement;
const system = window.matchMedia("(prefers-color-scheme: light)");

const systemTheme = (): Theme => (system.matches ? "light" : "dark");

export const currentTheme = (): Theme => (root.dataset.theme === "light" ? "light" : "dark");

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function remember(theme: Theme): void {
  try {
    if (theme === systemTheme()) localStorage.removeItem(KEY);
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

system.addEventListener("change", () => {
  if (!stored()) apply(systemTheme());
});
