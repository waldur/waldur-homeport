const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
].join(',');

const isRendered = (element: HTMLElement) => {
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
  }
  return true;
};

/**
 * Elements inside `root` that Tab stops on, in document order. Enough for
 * header chrome; it does not reorder by positive tabindex values.
 */
export const getTabbables = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute('hidden') &&
      isRendered(element),
  );

/**
 * The first Tab stop after `reference` in the document, skipping anything
 * inside `reference` itself or inside `exclude`.
 */
export const getTabbableAfter = (
  reference: Element,
  exclude?: Element | null,
): HTMLElement | null =>
  getTabbables(document.body).find(
    (element) =>
      !reference.contains(element) &&
      !exclude?.contains(element) &&
      Boolean(
        reference.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
  ) ?? null;
