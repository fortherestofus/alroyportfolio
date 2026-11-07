/**
 * Project-page clips and the hover previews on project tiles.
 *
 * Clips (WorkVideo.astro):
 *  - a loop plays muted while at least half of it is on screen, and
 *    pauses when it leaves, so a page of clips is never decoding ten
 *    videos at once. Reduced motion: nothing starts on its own;
 *  - the "Sound on" button unmutes, starting the clip if it was paused,
 *    and stays in step with the native mute control;
 *  - only one clip plays with sound at a time. Turning sound on in one
 *    mutes the others, rather than leaving two soundtracks running.
 *
 * Tiles (WorkTile.astro): a short silent loop over the cover on hover,
 * only for a mouse, only without reduced motion, and only fetched the
 * first time someone actually hovers.
 */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ---- Clips ---------------------------------------------------------- */

const clips = Array.from(document.querySelectorAll<HTMLElement>("[data-work-video]"));

function syncSound(figure: HTMLElement, video: HTMLVideoElement): void {
  const button = figure.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  const label = button?.querySelector<HTMLElement>("[data-sound-label]");
  if (!button || !label) return;
  const on = !video.muted;
  button.setAttribute("aria-pressed", String(on));
  label.textContent = on ? "Sound off" : "Sound on";
}

function muteOthers(except: HTMLVideoElement): void {
  for (const figure of clips) {
    const other = figure.querySelector("video");
    if (other && other !== except && !other.muted) {
      other.muted = true;
      // A film playing with sound is being watched; a muted film is not.
      if (figure.dataset.mode === "film") other.pause();
    }
  }
}

for (const figure of clips) {
  const video = figure.querySelector("video");
  if (!video) continue;

  figure.querySelector("[data-sound-toggle]")?.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) {
      muteOthers(video);
      if (video.paused) video.play().catch(() => {});
    }
  });

  // The native control bar can change the volume too; keep the button honest.
  video.addEventListener("volumechange", () => {
    if (!video.muted) muteOthers(video);
    syncSound(figure, video);
  });
}

const loops = clips.filter((figure) => figure.dataset.mode === "loop");

if (loops.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target.querySelector("video");
        if (!video) continue;
        if (entry.isIntersecting) {
          if (!reduceMotion.matches) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      }
    },
    { threshold: 0.5 },
  );
  loops.forEach((figure) => observer.observe(figure));
}

/* ---- Tile previews ------------------------------------------------- */

for (const tile of document.querySelectorAll<HTMLElement>("[data-work-tile]")) {
  const preview = tile.querySelector<HTMLVideoElement>("video[data-src]");
  if (!preview) continue;

  const start = () => {
    if (!finePointer.matches || reduceMotion.matches) return;
    if (!preview.src) preview.src = preview.dataset.src!;
    preview.play().catch(() => {});
  };
  const stop = () => {
    preview.pause();
    tile.classList.remove("is-previewing");
  };

  // Fade in only once a frame is actually showing, never a blank box.
  preview.addEventListener("playing", () => tile.classList.add("is-previewing"));
  tile.addEventListener("pointerenter", start);
  tile.addEventListener("pointerleave", stop);
  tile.addEventListener("focus", start);
  tile.addEventListener("blur", stop);
}
