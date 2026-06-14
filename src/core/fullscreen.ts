// Safari (and older Chrome) only expose the webkit-prefixed Fullscreen API.
export function getFullscreenElement(): Element | null {
  return (
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    null
  );
}
