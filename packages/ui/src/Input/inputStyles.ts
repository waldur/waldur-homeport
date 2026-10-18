import { cva } from 'class-variance-authority';

export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input and Textarea share one look: the legacy Bootstrap/Metronic
 * `.form-control`, rebuilt from waldur-design-tokens/input.css so it renders
 * the same with or without Metronic loaded.
 *
 * Sizes are px, not rem: waldur-homeport forces a 13px root (12px on mobile)
 * while the micro-apps keep the browser's 16px, so a rem input would be a
 * different size in each. The legacy values were 0.692rem / 0.925rem padding,
 * 1.08rem text and a 1.43 line-height at the 13px root -- 9px / 12px, 14px
 * and 20px here.
 *
 * `border-[1px]`, not `border`, and `pl-[12px]`, not `p-3`: Bootstrap's
 * `.border` and `.p-*` utilities are `!important` and would win over these
 * (see the class-name collision table in
 * docs/tailwind-shadcn-migration-notes.md). Padding is `pl`/`pr` rather than
 * `px` so the invalid state can widen the right side alone, and a caller's
 * `px-*` still replaces both through `cn`. An InputGroup sets `--input-start`
 * and `--input-end` to the width of its adornments and of the invalid icon it
 * draws, which pushes the text clear of them.
 *
 * Every class here is a literal: Tailwind only generates class names it
 * finds written out in source, so none of them can be assembled at runtime.
 */
const COMMON =
  'block w-full min-w-0 appearance-none bg-clip-padding font-normal ' +
  'border-[1px] border-solid border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] ' +
  'placeholder:text-[var(--input-placeholder)] placeholder:opacity-100 ' +
  'transition-[border-color,box-shadow,background-color] duration-150 ease-[ease-in-out] motion-reduce:transition-none ' +
  // The border and a 1px ring of the same colour are the focus indicator,
  // replacing the app-wide outline.
  'focus:outline-none focus:border-[var(--input-border-focus)] focus:[box-shadow:var(--input-focus-ring)] ' +
  'aria-invalid:border-[var(--input-invalid-border)] aria-invalid:focus:border-[var(--input-invalid-border-focus)] aria-invalid:focus:[box-shadow:var(--input-invalid-focus-ring)] ' +
  'disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-text)] disabled:placeholder:text-[var(--input-disabled-text)] ' +
  // Number inputs never show the browser's spin buttons.
  '[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&[type=number]]:[-moz-appearance:textfield]';

// Hover previews the focus colour, but not on a control that cannot be typed
// into, is focused already or is showing an error.
const HOVER_EDITABLE =
  ' [&:hover:read-write:not(:focus,[aria-invalid=true])]:border-[var(--input-border-hover)]';
// A <select> is never `:read-write`, so it is `:disabled` that rules it out.
const HOVER_SELECT =
  ' [&:hover:not(:disabled,:focus,[aria-invalid=true])]:border-[var(--input-border-hover)]';

const variants = {
  size: {
    sm: 'rounded-md py-[5px] pl-[calc(10px+var(--input-start,0px))] pr-[calc(10px+var(--input-end,0px))] text-xs leading-[17px]',
    md: 'rounded-lg py-[9px] pl-[calc(12px+var(--input-start,0px))] pr-[calc(12px+var(--input-end,0px))] text-sm leading-[20px]',
    lg: 'rounded-lg py-[9px] pl-[calc(19.5px+var(--input-start,0px))] pr-[calc(19.5px+var(--input-end,0px))] text-base leading-[23px]',
  },
  solid: {
    // A filled, borderless-looking field; it keeps its fill when disabled.
    true:
      'bg-[var(--input-solid-bg)] text-[var(--input-solid-text)] ' +
      'focus:bg-[var(--input-solid-bg-focus)] focus:border-[var(--input-solid-border-focus)] ' +
      'disabled:bg-[var(--input-solid-bg)]',
    false: '[&[readonly]]:bg-[var(--input-readonly-bg)]',
  },
} as const;

export const inputVariants = cva(COMMON + HOVER_EDITABLE, {
  variants,
  defaultVariants: { size: 'md', solid: false },
});

export const textareaVariants = cva(COMMON + HOVER_EDITABLE + ' resize-y', {
  variants,
  defaultVariants: { size: 'md', solid: false },
});

/** A native <select>: the input look, with the pointer a select has. */
export const selectVariants = cva(COMMON + HOVER_SELECT + ' cursor-default', {
  variants,
  defaultVariants: { size: 'md', solid: false },
});
