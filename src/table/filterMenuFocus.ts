import { KeyboardEvent } from 'react';

/** Where the keyboard can land inside the filter menu or one of its
 * flyouts: a row button, a filter's own field, a link, an Apply/Cancel
 * button. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

/** Focus the first stop inside `container`, if it has one. */
export const focusFirstIn = (container: HTMLElement | null) =>
  container?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

/**
 * The filter menu and each of its flyouts are portaled to the end of the
 * document, so a native Tab out of one leaves the page instead of going
 * back to the row or trigger it belongs to. Close it at either edge
 * instead; the caller's close handling returns focus to that trigger, and
 * Tab carries on from there.
 */
export const closeFlyoutOnTabOut = (
  event: KeyboardEvent<HTMLElement>,
  close: () => void,
) => {
  if (event.key !== 'Tab') return;
  const stops = event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE);
  const edge = event.shiftKey ? stops[0] : stops[stops.length - 1];
  if (edge && edge !== document.activeElement) return;
  event.preventDefault();
  close();
};
