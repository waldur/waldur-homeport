export type ScrollContainer =
  | HTMLElement
  | Window
  | { current?: HTMLElement | Window | null | undefined }
  | (() => HTMLElement | Window | null | undefined)
  | string
  | null
  | undefined;

/**
 * Resolves a ScrollContainer parameter (element, window, RefObject, getter function, or selector)
 * to a concrete DOM element or window.
 */
export function resolveContainer(
  container?: ScrollContainer,
): HTMLElement | Window | null {
  if (typeof window === 'undefined' || !container) return null;
  if (typeof container === 'string') {
    return document.querySelector<HTMLElement>(container);
  }
  if (typeof container === 'function') {
    return container() ?? null;
  }
  if (container instanceof Window || container instanceof HTMLElement) {
    return container;
  }
  if ('current' in container) {
    return container.current ?? null;
  }
  return null;
}

export interface ScrollToSectionOptions {
  /**
   * Extra vertical offset in pixels from the top of the viewport or container.
   * Useful when a sticky header or topbar is present.
   * @default 180
   */
  offset?: number;
  /**
   * Scrolling behavior ('smooth' | 'auto' | 'instant').
   * @default 'smooth'
   */
  behavior?: ScrollBehavior;
  /**
   * Optional custom scrollable container. If not provided or null, defaults to window.
   */
  container?: ScrollContainer;
}

/**
 * Smoothly scrolls the window or a container to the element specified by ID or DOM reference.
 *
 * @param target - The ID string of the element or the HTMLElement reference itself.
 * @param optionsOrOffset - Either an options object or a number representing extraOffset.
 * @returns boolean indicating whether the target element was found and scrolled to.
 */
export function scrollToSection(
  target: string | HTMLElement | null | undefined,
  optionsOrOffset?: ScrollToSectionOptions | number,
): boolean {
  if (typeof window === 'undefined' || !target) return false;

  const options: ScrollToSectionOptions =
    typeof optionsOrOffset === 'number'
      ? { offset: optionsOrOffset }
      : optionsOrOffset || {};

  const { offset = 180, behavior = 'smooth', container } = options;

  const containerEl = resolveContainer(container);

  const safeId =
    typeof target === 'string'
      ? typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(target)
        : target
      : null;

  const el =
    typeof target === 'string'
      ? (containerEl instanceof HTMLElement && safeId
          ? containerEl.querySelector<HTMLElement>(`#${safeId}`)
          : null) || document.getElementById(target)
      : target;
  if (!el) return false;

  if (!containerEl || containerEl === window) {
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({
      left: 0,
      top: Math.max(0, top),
      behavior,
    });
  } else {
    const containerNode = containerEl as HTMLElement;
    const targetRect = el.getBoundingClientRect();
    const containerRect = containerNode.getBoundingClientRect();
    const top =
      containerNode.scrollTop + targetRect.top - containerRect.top - offset;
    containerNode.scrollTo({
      left: 0,
      top: Math.max(0, top),
      behavior,
    });
  }

  return true;
}

/**
 * Backwards-compatible alias for scrollToSection(section, extraOffset).
 *
 * @param section - Element ID to scroll into view.
 * @param extraOffset - Pixels of top offset to preserve (default 180).
 */
export const scrollToSectionById = (
  section: string,
  extraOffset = 180,
): boolean => {
  return scrollToSection(section, { offset: extraOffset });
};
