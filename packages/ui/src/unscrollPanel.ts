import { UIEvent } from 'react';

/**
 * onScroll handler for a panel that clips its content while sliding open or
 * closed (Accordion, Collapsible). Such a panel is never meant to scroll,
 * but a clipped box is still programmatically scrollable: an element that
 * takes focus inside it mid-slide — a table-filter select auto-focuses on
 * mount — makes the browser scroll the panel to reveal it, cutting off the
 * top of the content until the slide ends. Undo any such scroll at once.
 */
export const unscrollPanel = (event: UIEvent<HTMLElement>) => {
  const panel = event.currentTarget;
  if (panel.scrollTop !== 0) panel.scrollTop = 0;
  if (panel.scrollLeft !== 0) panel.scrollLeft = 0;
};
