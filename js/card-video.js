// Project cards with data-preview-video play a short muted gameplay clip while hovered or focused.
// The <video> is only created on first hover, so the clip costs nothing until someone asks for it.

export function shouldEnablePreview({ canHover, prefersReducedMotion, saveData }) {
  return canHover && !prefersReducedMotion && !saveData;
}

function createVideo(basePath) {
  const video = document.createElement("video");
  video.className = "project-card__video";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  video.setAttribute("aria-hidden", "true");
  for (const [extension, type] of [
    ["webm", "video/webm"],
    ["mp4", "video/mp4"],
  ]) {
    const source = document.createElement("source");
    source.src = `${basePath}.${extension}`;
    source.type = type;
    video.append(source);
  }
  video.addEventListener("playing", () => video.classList.add("is-playing"));
  return video;
}

export function initCardVideos() {
  const enabled = shouldEnablePreview({
    canHover: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(navigator.connection?.saveData),
  });
  if (!enabled) return;

  for (const media of document.querySelectorAll("[data-preview-video]")) {
    const card = media.closest(".project-card");
    let video = null;

    const start = () => {
      video ??= media.appendChild(createVideo(media.dataset.previewVideo));
      // play() rejects if the user leaves before it starts; that's expected, not an error
      video.play().catch(() => {});
    };
    const stop = () => {
      if (!video) return;
      video.pause();
      video.classList.remove("is-playing");
    };

    card.addEventListener("pointerenter", start);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) stop();
    });
    media.classList.add("has-preview");
  }
}
