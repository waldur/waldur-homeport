export type CheckSize = 'sm' | 'md';

/**
 * Checkbox, Radio and Switch share one structure: a box around a native
 * input that is invisible but sits on top of everything (`opacity-0`, not
 * `sr-only`), so it still takes every click, the focus, the keyboard and
 * the form state. Sibling elements after it draw the control — border,
 * fill, check, dash, dot, track, knob — and read the input's state through
 * Tailwind's `peer-*` variants. No background images, no data URIs.
 *
 * Colours come from waldur-design-tokens/checkColors.css. `border-[1px]`,
 * not `border`: Bootstrap's `.border` utility is `!important` and would
 * replace the colour (see the class-name collision table in
 * docs/tailwind-shadcn-migration-notes.md).
 *
 * Motion matches the legacy `$form-check-transition`: 0.15s `ease-in-out`
 * (the CSS keyword, hence `ease-[ease-in-out]` — Tailwind's own `ease-in-out`
 * is a different curve), switched off under `prefers-reduced-motion`, as
 * Bootstrap's `transition` mixin did. The marks appear without a transition,
 * as the legacy background images did.
 *
 * Every class here is a literal: Tailwind only generates class names it
 * finds written out in source, so none of them can be assembled at runtime.
 */

/** The invisible native input, and the `peer` every visual reads. */
export const HIDDEN_INPUT =
  'peer absolute inset-0 z-[1] m-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed';

const FOCUS_RING =
  'peer-focus-visible:outline-[2px] peer-focus-visible:outline-solid peer-focus-visible:outline-[var(--check-focus-ring)] peer-focus-visible:outline-offset-[2px]';

// px, not rem: the root font-size is forced to 13px (12px on mobile), so a
// rem size would track it. The legacy sizes were 1.539rem / 1.231rem, which
// is 20px / 16px at the desktop root.
export const BOX_SIZE: Record<CheckSize, string> = {
  sm: 'size-[16px]',
  md: 'size-[20px]',
};

/**
 * The box around a Checkbox or Radio: a one-cell grid, so the drawn box and
 * its mark share a cell and centre on each other. Layout classes from the
 * caller (margins, `pointer-events-none`) go here.
 */
export const BOX_WRAPPER =
  'relative inline-grid! shrink-0 place-items-center align-middle';

/**
 * The drawn box: white field, gray border, brand fill when on. `peer-hover`
 * needs no `not-checked`: the hover border is the same brand colour as the
 * checked one, and `peer-disabled` comes later in Tailwind's variant order,
 * so a disabled box ignores hover.
 */
export const BOX_VISUAL =
  'pointer-events-none [grid-area:1/1] size-full border-[1px] border-solid border-[var(--check-border)] bg-[var(--check-bg)] transition-[background-color,border-color] duration-150 ease-[ease-in-out] motion-reduce:transition-none ' +
  'peer-hover:border-[var(--check-border-hover)] ' +
  'peer-checked:border-[var(--check-checked-bg)] peer-checked:bg-[var(--check-checked-bg)] ' +
  'peer-disabled:border-[var(--check-disabled-border)] peer-disabled:bg-[var(--check-disabled-bg)] ' +
  FOCUS_RING;

/**
 * Checkbox only. `:indeterminate` also matches every radio in a group with
 * nothing selected, so these must never reach a Radio.
 */
export const CHECKBOX_VISUAL =
  'peer-indeterminate:border-[var(--check-checked-bg)] peer-indeterminate:bg-[var(--check-checked-bg)]';

export const BOX_RADIUS: Record<CheckSize, string> = {
  sm: 'rounded-[4px]',
  md: 'rounded-[6px]',
};

/**
 * A mark (check, dash, dot): hidden until its input state shows it, drawn in
 * `currentColor` — white on the brand fill, gray once disabled.
 */
export const MARK_BASE =
  'pointer-events-none [grid-area:1/1] hidden text-[var(--check-mark)] peer-disabled:text-[var(--check-mark-disabled)]';

/**
 * Switch sizes are the legacy `.form-switch` / `.form-switch-sm` at the 13px
 * root: 44×24 and 36×20, the knob 2px in from each edge. The knob travels
 * the track width minus its own width and both 2px insets.
 */
export const SWITCH_SIZE: Record<CheckSize, string> = {
  sm: 'h-[20px] w-[36px]',
  md: 'h-[24px] w-[44px]',
};

export const SWITCH_WRAPPER = 'relative inline-flex shrink-0 align-middle';

/**
 * The track. Hover only shades an unchecked, enabled track, and a checked
 * disabled one keeps a pale brand fill; both need a compound state, hence
 * the arbitrary `peer-[…]` variants.
 */
export const SWITCH_TRACK =
  'pointer-events-none size-full rounded-full border-[1px] border-solid border-[var(--switch-track-border)] bg-[var(--switch-track)] transition-[background-color,border-color] duration-150 ease-[ease-in-out] motion-reduce:transition-none ' +
  'peer-[:hover:enabled:not(:checked)]:bg-[var(--switch-track-hover)] ' +
  'peer-checked:border-[var(--switch-track-checked)] peer-checked:bg-[var(--switch-track-checked)] ' +
  'peer-disabled:bg-[var(--switch-track-disabled)] ' +
  'peer-[:checked:disabled]:border-[var(--switch-track-checked-disabled)] peer-[:checked:disabled]:bg-[var(--switch-track-checked-disabled)] ' +
  FOCUS_RING;

/** The knob: a 1px ring in the knob-border colour while off. */
export const SWITCH_KNOB =
  'pointer-events-none absolute top-[2px] left-[2px] rounded-full bg-[var(--switch-knob)] transition-transform duration-150 ease-[ease-in-out] motion-reduce:transition-none ' +
  '[box-shadow:0_0_0_1px_var(--switch-knob-border),0_1px_2px_rgb(16_24_40/0.06)] ' +
  'peer-checked:[box-shadow:0_1px_2px_rgb(16_24_40/0.06)] ' +
  'peer-disabled:bg-[var(--switch-knob-disabled)] peer-disabled:[box-shadow:none] ' +
  'peer-[:checked:disabled]:bg-[var(--switch-knob-checked-disabled)]';

export const SWITCH_KNOB_SIZE: Record<CheckSize, string> = {
  sm: 'size-[16px] peer-checked:translate-x-[16px]',
  md: 'size-[20px] peer-checked:translate-x-[20px]',
};
