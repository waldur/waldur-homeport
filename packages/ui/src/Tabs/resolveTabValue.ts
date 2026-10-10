/**
 * The tab to show: `requested` when it is one of `selectable`, the first of
 * `selectable` otherwise. So a bar never opens on nothing — when no tab was
 * chosen yet, the chosen one is hidden or disabled, or it went away later
 * (a permission or a count that arrived after the first render).
 */
export const resolveTabValue = (
  selectable: readonly string[],
  requested: string | undefined,
): string | undefined =>
  requested !== undefined && selectable.includes(requested)
    ? requested
    : selectable[0];
