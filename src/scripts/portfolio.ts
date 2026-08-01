/**
 * Portfolio modal carousel (PRD §6.04, §12b).
 *
 * Requirements this has to meet: opens from a card, traps focus, closes
 * on Escape and on the scrim, returns focus to the card that opened it,
 * locks background scroll, and is fully operable by button and keyboard
 * rather than drag alone. Swipe is an addition on top, never the only
 * way through.
 */
import { lockScroll, unlockScroll } from "./journey";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const modal = document.getElementById("portfolio-modal");
const panel = modal?.querySelector<HTMLElement>("[data-portfolio-panel]");
const stage = modal?.querySelector<HTMLElement>("[data-portfolio-stage]");
const titleEl = modal?.querySelector<HTMLElement>("[data-portfolio-title]");
const counterEl = modal?.querySelector<HTMLElement>("[data-portfolio-counter]");
const dotsEl = modal?.querySelector<HTMLElement>("[data-portfolio-dots]");
const prevButton = modal?.querySelector<HTMLButtonElement>("[data-portfolio-prev]");
const nextButton = modal?.querySelector<HTMLButtonElement>("[data-portfolio-next]");

if (modal && panel && stage && titleEl && counterEl && dotsEl && prevButton && nextButton) {
  let slides: HTMLElement[] = [];
  let index = 0;
  let openedBy: HTMLElement | null = null;

  const FOCUSABLE =
    'a[href], button:not(:disabled), input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])';

  /* ---- Slide state ------------------------------------------------ */

  function stopVideoIn(slide: HTMLElement): void {
    const video = slide.querySelector<HTMLVideoElement>("video");
    if (!video) return;
    video.pause();
    // Dropping the source releases the buffer, so leaving a slide stops
    // it downloading in the background.
    video.currentTime = 0;
  }

  function show(next: number): void {
    if (slides.length === 0) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, next));

    slides.forEach((slide, i) => {
      const active = i === clamped;
      slide.hidden = !active;
      if (!active) stopVideoIn(slide);
    });

    index = clamped;
    counterEl!.textContent = `${index + 1} of ${slides.length}`;

    prevButton!.disabled = index === 0;
    nextButton!.disabled = index === slides.length - 1;

    dotsEl!.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    /*
     * Autoplay the clip on the slide the reader landed on: these are
     * silent loops and that is how they are meant to read. Reduced
     * motion leaves it paused behind its poster, controls and all.
     */
    const video = slides[index].querySelector<HTMLVideoElement>("video");
    if (video && !reduceMotion.matches) {
      video.play().catch(() => {
        // Autoplay refused; the controls are still there.
      });
    }
  }

  function buildDots(count: number): void {
    dotsEl!.replaceChildren();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pm__dot";
      dot.dataset.dot = String(i);
      dot.setAttribute("aria-label", `Shot ${i + 1} of ${count}`);
      dot.addEventListener("click", () => show(i));
      dotsEl!.append(dot);
    }
  }

  /* ---- Open and close --------------------------------------------- */

  function open(categoryId: string, trigger: HTMLElement): void {
    const group = stage!.querySelector<HTMLElement>(`[data-portfolio-group="${categoryId}"]`);
    if (!group) return;

    stage!.querySelectorAll<HTMLElement>("[data-portfolio-group]").forEach((g) => {
      g.hidden = g !== group;
    });

    slides = Array.from(group.querySelectorAll<HTMLElement>("[data-portfolio-slide]"));
    openedBy = trigger;

    titleEl!.textContent = trigger.querySelector(".work__name")?.textContent ?? "Portfolio";
    buildDots(slides.length);

    modal!.hidden = false;
    lockScroll();
    show(0);

    // Focus the dialog itself, so a screen reader announces the title
    // rather than dropping the user onto the first control.
    panel!.focus();
  }

  function close(): void {
    if (modal!.hidden) return;
    slides.forEach(stopVideoIn);
    modal!.hidden = true;
    unlockScroll();
    openedBy?.focus();
    openedBy = null;
  }

  /* ---- Wiring ------------------------------------------------------ */

  document.querySelectorAll<HTMLElement>("[data-open-portfolio]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const id = trigger.dataset.openPortfolio;
      if (id) open(id, trigger);
    });
  });

  modal.querySelectorAll<HTMLElement>("[data-portfolio-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  prevButton.addEventListener("click", () => show(index - 1));
  nextButton.addEventListener("click", () => show(index + 1));

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
      return;
    }

    if (event.key !== "Tab") return;

    // Focus trap: wrap at both ends of the dialog's own controls.
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === panel,
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---- Swipe, as an addition to the buttons ------------------------ */

  let startX = 0;
  let swiping = false;

  stage.addEventListener("pointerdown", (event) => {
    // Never swallow a drag on the video's own scrubber.
    if ((event.target as HTMLElement).closest("video")) return;
    swiping = true;
    startX = event.clientX;
  });

  stage.addEventListener("pointerup", (event) => {
    if (!swiping) return;
    swiping = false;
    const distance = event.clientX - startX;
    const THRESHOLD = 48;
    if (distance > THRESHOLD) show(index - 1);
    else if (distance < -THRESHOLD) show(index + 1);
  });

  stage.addEventListener("pointercancel", () => {
    swiping = false;
  });
}
