import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

/**
 * Inline code: an identifier, a value, a command or a path inside running
 * text. Its look is one rule on its data-slot, shared with the inline code in
 * rendered markdown (`.rich-text`, src/tailwind.css), on semantic tokens
 * (--text-code, --bg-code, --inline-shadow). The rule sits below the
 * utilities, so a caller's class wins (`text-xs`, `text-quaternary`, `mx-0`).
 */
export const Code = forwardRef<HTMLElement, ComponentPropsWithoutRef<'code'>>(
  (props, ref) => (
    // eslint-disable-next-line waldur-custom/no-raw-code-element -- the component itself
    <code ref={ref} data-slot="code" {...props} />
  ),
);
Code.displayName = 'Code';

/** A key or a shortcut to press, such as the search box's ⌘K hint. */
export const Kbd = forwardRef<HTMLElement, ComponentPropsWithoutRef<'kbd'>>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line waldur-custom/no-raw-code-element -- the component itself
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        'rounded-lg bg-quaternary px-1.5 py-0.5 font-sans text-xs leading-none text-secondary select-none',
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = 'Kbd';
