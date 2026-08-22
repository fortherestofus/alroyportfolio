/**
 * Motion for the journey page: Lenis smooth scroll, GSAP reveals, and
 * the timeline nav's scroll tracking / drag-to-scrub (PRD §5.1, §8).
 *
 * Everything degrades in a defined way:
 *   - no JS at all      → plain anchor links, native scrolling
 *   - reduced motion    → no Lenis, no drag scrub, reveals are fades
 *   - nav absent        → smooth scroll and reveals still initialise
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = () => reduceMotionQuery.matches;

/* ------------------------------------------------------------------
   Smooth scroll
   ------------------------------------------------------------------ */

let lenis: Lenis | null = null;
let stepCount = 0;

/** Steps Lenis; registered on gsap's ticker so it runs before ScrollTrigger reads. */
function stepLenis(time: number): void {
  stepCount++;
  // gsap reports seconds, Lenis expects milliseconds.
  lenis?.raf(time * 1000);
}

function initSmoothScroll(): void {
  if (prefersReducedMotion()) return;

  try {
    lenis = new Lenis({
      duration: 1.05,
      // Expo-out: quick to leave, long settle.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
  } catch {
    lenis = null;
    return;
  }

  lenis.on("scroll", ScrollTrigger.update);

  // Sharing gsap's ticker keeps the page on a single rAF loop and
  // guarantees Lenis has moved before ScrollTrigger measures.
  stepCount = 0;
  gsap.ticker.add(stepLenis);
  gsap.ticker.lagSmoothing(0);

  /*
   * Lenis swallows wheel and touch input and then applies the movement
   * itself on each frame, so if its loop never runs the page becomes
   * completely unscrollable. This watchdog runs on a timer rather than
   * a frame so it can still fire in exactly that situation: if no frame
   * has been stepped shortly after init, drop Lenis and hand scrolling
   * back to the browser.
   *
   * A hidden tab has no frames by design, which is not a fault, so the
   * check waits for the page to actually be visible before judging.
   * Otherwise loading in a background tab would permanently downgrade
   * the page to native scrolling.
   */
  const verifyRunning = () => {
    if (document.hidden) return;
    window.setTimeout(() => {
      if (lenis && stepCount === 0) destroySmoothScroll();
    }, 1200);
  };

  if (document.hidden) {
    document.addEventListener("visibilitychange", verifyRunning, { once: true });
  } else {
    verifyRunning();
  }
}

function destroySmoothScroll(): void {
  gsap.ticker.remove(stepLenis);
  lenis?.destroy();
  lenis = null;
}

/**
 * Freeze the page behind an overlay. Lenis owns the scroll when it is
 * running, so telling it to stop is what actually holds the page still;
 * the class covers the native path (reduced motion, or Lenis dropped by
 * the watchdog).
 */
export function lockScroll(): void {
  lenis?.stop();
  document.documentElement.classList.add("is-scroll-locked");
}

export function unlockScroll(): void {
  lenis?.start();
  document.documentElement.classList.remove("is-scroll-locked");
}

/** Scroll to an absolute document offset, respecting motion settings. */
function scrollToOffset(top: number, immediate = false): void {
  const target = Math.max(0, top);

  if (lenis) {
    // A jump across sections gets a longer travel than a wheel scroll,
    // so the reader can follow where the page went.
    lenis.scrollTo(target, immediate ? { immediate: true } : { duration: 1.4 });
    return;
  }

  window.scrollTo({
    top: target,
    behavior: immediate || prefersReducedMotion() ? "auto" : "smooth",
  });
}

/* ------------------------------------------------------------------
   Reveals
   ------------------------------------------------------------------ */

/**
 * Elements marked `data-reveal` fade (and rise, unless motion is
 * reduced) into view once. A group can stagger its children by marking
 * them `data-reveal-item`.
 *
 * The pre-animation hidden state lives in CSS behind the `.js` class,
 * so content is never hidden from a visitor whose JS never ran.
 */
function initReveals(): void {
  const groups = gsap.utils.toArray<HTMLElement>("[data-reveal]");

  groups.forEach((group) => {
    const children = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
    const targets = children.length > 0 ? children : [group];

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion() ? 0.3 : 0.5,
      ease: "power2.out",
      stagger: prefersReducedMotion() ? 0 : 0.08,
      scrollTrigger: {
        trigger: group,
        // Generous start so anything already on screen reveals at once.
        start: "top 92%",
        once: true,
      },
    });
  });
}

/**
 * Each section's left column fades in as the section arrives and out as
 * it leaves, which reads as a crossfade between consecutive sections
 * because they overlap while sticky.
 */
function initAsideCrossfade(sections: HTMLElement[]): void {
  if (prefersReducedMotion()) return;

  sections.forEach((section) => {
    const aside = section.querySelector<HTMLElement>("[data-section-aside]");
    if (!aside) return;

    gsap.fromTo(
      aside,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      },
    );
  });
}

/* ------------------------------------------------------------------
   Timeline nav
   ------------------------------------------------------------------ */

interface Stop {
  /** Document offset that counts as "this section is showing". */
  top: number;
  /** Where this section's label sits along the track, 0-1. */
  frac: number;
  link: HTMLAnchorElement;
  peg: SVGCircleElement | null;
  section: HTMLElement;
}

function initJourneyNav(): void {
  const nav = document.getElementById("journey-nav");
  const track = document.getElementById("journey-track");
  const wire = document.getElementById("journey-wire");
  const wireBase = document.getElementById("journey-wire-base");
  const wireProgress = document.getElementById("journey-wire-progress");
  const knob = document.getElementById("journey-knob");
  if (!nav || !track || !wire || !wireBase || !wireProgress || !knob) return;

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  if (links.length === 0) return;

  let stops: Stop[] = [];
  let dragging = false;
  let activeIndex = -1;

  // Wire geometry, refreshed on every measure.
  let trackWidth = 1;
  let baseY = 0;
  let sagMax = 0;
  let sagEase = 1;

  // Handle position: where it is now, where it is heading.
  let currentFrac = 0;
  let targetFrac = 0;
  let followId = 0;

  /** True once the viewport is wide enough for the track to be visible. */
  const trackVisible = () => track.offsetParent !== null;

  /** Document offset at which a section is considered current. */
  function anchorFor(section: HTMLElement): number {
    return section.getBoundingClientRect().top + window.scrollY - nav!.offsetHeight;
  }

  function measure(): void {
    const trackRect = track!.getBoundingClientRect();
    const width = trackRect.width || 1;

    trackWidth = width;

    // Wire geometry comes from the token layer, not from magic numbers.
    const styles = getComputedStyle(track!);
    baseY = parseFloat(styles.getPropertyValue("--wire-base-y")) || 0;
    sagMax = parseFloat(styles.getPropertyValue("--wire-sag")) || 0;
    sagEase = parseFloat(styles.getPropertyValue("--wire-sag-ease")) || 1;

    wire!.setAttribute("viewBox", `0 0 ${width} ${trackRect.height || 1}`);

    stops = links
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1) ?? "";
        const section = document.getElementById(id);
        if (!section) return null;

        const linkRect = link.getBoundingClientRect();
        const centre = linkRect.left + linkRect.width / 2 - trackRect.left;

        return {
          top: anchorFor(section),
          frac: Math.min(1, Math.max(0, centre / width)),
          link,
          peg: track!.querySelector<SVGCircleElement>(`[data-peg="${id}"]`),
          section,
        };
      })
      .filter((stop): stop is Stop => stop !== null);

    stops.forEach((stop) => {
      if (stop.peg) {
        stop.peg.setAttribute("cx", String(stop.frac * width));
        stop.peg.setAttribute("cy", String(baseY));
      }
    });
  }

  /**
   * The wire as a pair of cubic curves meeting under the handle. The
   * handle pulls its own point down by `sag`, and the control points
   * either side ease the bend back to level, so the line behaves like
   * something being physically dragged rather than a bar being filled.
   * `endAtHand` returns just the travelled half, drawn in accent green.
   */
  function wirePath(handX: number, endAtHand = false): string {
    const firstX = (stops[0]?.frac ?? 0) * trackWidth;
    const lastX = (stops[stops.length - 1]?.frac ?? 1) * trackWidth;

    // Sag fades out near the ends, where the wire is anchored.
    const distanceFromEnd = Math.max(0, Math.min(handX - firstX, lastX - handX));
    const sag = sagMax * Math.min(1, distanceFromEnd / sagEase);
    const handY = baseY + sag;

    const lead =
      `M ${firstX} ${baseY} ` +
      `C ${firstX + (handX - firstX) * 0.5} ${baseY}, ` +
      `${firstX + (handX - firstX) * 0.92} ${handY}, ${handX} ${handY}`;

    if (endAtHand) return lead;

    return (
      `${lead} C ${handX + (lastX - handX) * 0.08} ${handY}, ` +
      `${handX + (lastX - handX) * 0.5} ${baseY}, ${lastX} ${baseY}`
    );
  }

  /** Vertical position of the wire under the handle, for placing the knob. */
  function handYFor(handX: number): number {
    const firstX = (stops[0]?.frac ?? 0) * trackWidth;
    const lastX = (stops[stops.length - 1]?.frac ?? 1) * trackWidth;
    const distanceFromEnd = Math.max(0, Math.min(handX - firstX, lastX - handX));
    return baseY + sagMax * Math.min(1, distanceFromEnd / sagEase);
  }

  /** Scroll position → position along the track, interpolating between stops. */
  function scrollToFrac(scrollY: number): number {
    if (stops.length === 0) return 0;
    if (scrollY <= stops[0].top) return stops[0].frac;

    const last = stops[stops.length - 1];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    // The final section often cannot reach its own anchor offset, so
    // treat the bottom of the page as arrival.
    const lastTop = Math.min(last.top, maxScroll);
    if (scrollY >= lastTop) return last.frac;

    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];
      const toTop = i + 1 === stops.length - 1 ? lastTop : to.top;

      if (scrollY >= from.top && scrollY <= toTop) {
        const span = Math.max(1, toTop - from.top);
        const t = (scrollY - from.top) / span;
        return from.frac + (to.frac - from.frac) * t;
      }
    }

    return last.frac;
  }

  /** Inverse of the above, for dragging the knob. */
  function fracToScroll(frac: number): number {
    if (stops.length === 0) return 0;
    if (frac <= stops[0].frac) return stops[0].top;

    const last = stops[stops.length - 1];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const lastTop = Math.min(last.top, maxScroll);
    if (frac >= last.frac) return lastTop;

    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];
      const toTop = i + 1 === stops.length - 1 ? lastTop : to.top;

      if (frac >= from.frac && frac <= to.frac) {
        const span = Math.max(0.0001, to.frac - from.frac);
        const t = (frac - from.frac) / span;
        return from.top + (toTop - from.top) * t;
      }
    }

    return lastTop;
  }

  /** Index of the section the reader is currently in. */
  function currentIndex(scrollY: number): number {
    /*
     * At the very bottom of the document the last section is current by
     * definition, whether or not its anchor line was ever reached. A
     * short final section on a tall viewport cannot scroll far enough to
     * cross its own anchor, so without this the nav sticks on the
     * second-to-last item for the entire end of the page.
     */
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0 && scrollY >= maxScroll - 2) return stops.length - 1;

    let index = 0;
    stops.forEach((stop, i) => {
      // A small tolerance keeps the active state from flickering when a
      // section boundary lands exactly on the anchor line.
      if (scrollY >= stop.top - 2) index = i;
    });
    return index;
  }

  function setActive(index: number): void {
    if (index === activeIndex) return;
    activeIndex = index;

    stops.forEach((stop, i) => {
      if (i === index) stop.link.setAttribute("aria-current", "true");
      else stop.link.removeAttribute("aria-current");

      if (stop.peg) {
        stop.peg.dataset.active = String(i === index);
        stop.peg.dataset.passed = String(i < index);
      }
    });

    // Keep the active pill in view on the mobile bar.
    if (!trackVisible()) {
      stops[index]?.link.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  /** Draw the wire and place the handle at a given position along it. */
  function render(frac: number): void {
    currentFrac = frac;
    const handX = frac * trackWidth;

    wireBase!.setAttribute("d", wirePath(handX));
    wireProgress!.setAttribute("d", wirePath(handX, true));

    knob!.style.left = `${handX}px`;
    knob!.style.top = `${handYFor(handX)}px`;
  }

  /**
   * Ease the handle toward its target instead of snapping, so the wire
   * visibly trails and settles. Dragging bypasses this: under the
   * pointer the handle must sit exactly where the finger is.
   */
  function renderTowards(target: number): void {
    targetFrac = target;

    if (prefersReducedMotion() || dragging) {
      render(target);
      return;
    }

    if (followId !== 0) return;

    const follow = () => {
      const difference = targetFrac - currentFrac;
      if (Math.abs(difference) > 0.0004) {
        render(currentFrac + difference * 0.18);
        followId = requestAnimationFrame(follow);
      } else {
        render(targetFrac);
        followId = 0;
      }
    };
    followId = requestAnimationFrame(follow);
  }

  function update(): void {
    const scrollY = window.scrollY;
    setActive(currentIndex(scrollY));
    if (!dragging) renderTowards(scrollToFrac(scrollY));
    // Reaching the second section is proof enough that the reader can
    // move around without being told about the scrub handle.
    if (stops.length > 1 && scrollY >= stops[1].top) markTaught();
  }

  /* ---- Click a label -------------------------------------------- */
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (!section) return;

      event.preventDefault();
      scrollToOffset(anchorFor(section));
      // Reflect the destination immediately rather than waiting for the
      // scroll to arrive.
      history.replaceState(null, "", `#${id}`);
    });
  });

  /* ---- Landing on a section from another page -------------------- */
  /*
   * Arriving at /#products used to leave you thousands of pixels past
   * section 05. The browser jumps to the anchor at first layout, then
   * the page keeps growing underneath it — lazy images, the section
   * Lotties, the booking embed — so the destination slides away from
   * wherever the reader was put.
   *
   * The fix is to re-assert the position while the document is still
   * changing height, for a bounded window, and to stop the moment the
   * reader scrolls: correcting a landing is helpful, fighting someone
   * who has taken over is not.
   */
  function settleHash(): void {
    const id = location.hash.slice(1);
    if (!id) return;
    const section = document.getElementById(id);
    if (section) scrollToOffset(anchorFor(section), true);
  }

  if (location.hash) {
    settleHash();

    let lastHeight = document.documentElement.scrollHeight;
    let ticks = 0;
    const timer = window.setInterval(() => {
      const height = document.documentElement.scrollHeight;
      if (height !== lastHeight) {
        lastHeight = height;
        settleHash();
      }
      // ~3s, long enough for the heaviest section to finish arriving.
      if (++ticks > 30) window.clearInterval(timer);
    }, 100);

    const release = () => window.clearInterval(timer);
    window.addEventListener("wheel", release, { once: true, passive: true });
    window.addEventListener("touchstart", release, { once: true, passive: true });
    window.addEventListener("keydown", release, { once: true });

    window.addEventListener(
      "load",
      () => {
        ScrollTrigger.refresh();
        settleHash();
      },
      { once: true },
    );
  }

  /* ---- Drag the knob -------------------------------------------- */
  function pointerFrac(clientX: number): number {
    const rect = track!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / (rect.width || 1)));
  }

  /**
   * Retire the "drag to scrub" prompt once the reader has demonstrably
   * got the idea, either by scrubbing or just by moving down the page.
   */
  function markTaught(): void {
    if (knob!.dataset.taught === "true") return;
    knob!.dataset.taught = "true";
  }

  knob.addEventListener("pointerdown", (event) => {
    // Scrub is a pointer affordance only; with reduced motion the
    // labels remain the way to move (PRD §8).
    if (prefersReducedMotion() || !trackVisible()) return;

    dragging = true;
    knob.dataset.dragging = "true";
    markTaught();
    knob.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  knob.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const frac = pointerFrac(event.clientX);
    // Straight to the pointer, no easing: under the finger the handle
    // must not lag, and the wire bends with it.
    targetFrac = frac;
    render(frac);
    scrollToOffset(fracToScroll(frac), true);
  });

  function endDrag(event: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    delete knob!.dataset.dragging;
    knob!.releasePointerCapture?.(event.pointerId);
    update();
  }

  knob.addEventListener("pointerup", endDrag);
  knob.addEventListener("pointercancel", endDrag);

  /* ---- Keep in sync --------------------------------------------- */
  measure();
  update();

  /*
   * Tracked from the plain scroll event, not from ScrollTrigger's
   * update cycle. The nav is navigation, not decoration: it has to keep
   * working when the animation loop does not run at all (reduced
   * motion, a throttled background tab, or GSAP failing to load).
   * Lenis scrolls the window for real, so this fires either way.
   */
  window.addEventListener("scroll", update, { passive: true });

  ScrollTrigger.addEventListener("refresh", () => {
    measure();
    update();
  });

  // Fonts landing late change label widths, which moves the stops.
  document.fonts?.ready.then(() => {
    measure();
    update();
  });

  window.addEventListener("resize", () => {
    measure();
    update();
  });
}

/* ------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */

function init(): void {
  initSmoothScroll();

  const sections = gsap.utils.toArray<HTMLElement>(".jsection");
  initAsideCrossfade(sections);
  initReveals();
  initJourneyNav();

  ScrollTrigger.refresh();
}

init();

/**
 * Honour a mid-session change to the motion preference: tear down
 * Lenis (or bring it back) rather than leaving the page in the mode it
 * booted in.
 */
reduceMotionQuery.addEventListener("change", () => {
  if (prefersReducedMotion() && lenis) destroySmoothScroll();
  else if (!prefersReducedMotion() && !lenis) initSmoothScroll();
  ScrollTrigger.refresh();
});
