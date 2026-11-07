/**
 * Horizontal rails: a native scroll-snap row with previous and next
 * buttons, used where a stack of cards would make a section too tall
 * (the testimonials and the recognition cards in section 01).
 *
 * Built on the guidance in NN/g's "Designing Effective Carousels" and
 * Baymard's carousel research: it never moves on its own, the controls
 * sit with the content, and where there is one card per view a "1 / 3"
 * count says how many there are and where the reader is. The row is a
 * real scroll container, so touch, trackpad and keyboard work with no
 * script at all; this only adds the buttons and keeps them honest
 * (disabled at either end, hidden when everything already fits).
 *
 * Markup: [data-rail] around a [data-rail-track] list and a
 * RailControls component.
 */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

function setUp(rail: HTMLElement): void {
  const track = rail.querySelector<HTMLElement>("[data-rail-track]");
  const controls = rail.querySelector<HTMLElement>("[data-rail-controls]");
  const prev = rail.querySelector<HTMLButtonElement>("[data-rail-prev]");
  const next = rail.querySelector<HTMLButtonElement>("[data-rail-next]");
  const count = rail.querySelector<HTMLElement>("[data-rail-count]");
  if (!track || !controls || !prev || !next) return;

  const items = () => Array.from(track.children) as HTMLElement[];

  /** One card plus the gap after it, measured rather than assumed. */
  const step = (): number => {
    const [first, second] = items();
    if (!first) return track.clientWidth;
    if (!second) return first.getBoundingClientRect().width;
    return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  };

  const update = (): void => {
    const overflow = track.scrollWidth - track.clientWidth > 1;
    controls.hidden = !overflow;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    if (count) {
      const total = items().length;
      const index = Math.min(total - 1, Math.round(track.scrollLeft / Math.max(1, step())));
      count.textContent = `${index + 1} / ${total}`;
    }
  };

  const go = (direction: 1 | -1): void => {
    track.scrollBy({ left: direction * step(), behavior: reduced.matches ? "auto" : "smooth" });
  };

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  let frame = 0;
  const schedule = (): void => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  track.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.fonts?.ready.then(update);
  update();
}

document.querySelectorAll<HTMLElement>("[data-rail]").forEach(setUp);
