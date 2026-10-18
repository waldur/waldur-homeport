import { ElementType, forwardRef, HTMLAttributes } from 'react';

import { cn } from '../cn';

export interface FormHeadingProps extends HTMLAttributes<HTMLElement> {
  /** `span` by default; `p` or `div` when it should be a block of its own. */
  as?: ElementType;
  /** Adds the red asterisk. */
  required?: boolean;
}

/**
 * Text that looks like a field's label but names no control: a read-only
 * value's caption, a preview, a group of buttons. A `<label>` is for a
 * control (`FormLabel`), a group of controls is a `FormFieldset` with a
 * `FormLegend`; this is for the rest. Give it an `id` and point an
 * `aria-labelledby` at it when it names a region.
 */
export const FormHeading = forwardRef<HTMLElement, FormHeadingProps>(
  ({ as: Component = 'span', required, className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'mb-[6.5px] inline-block text-sm leading-[20px] font-medium text-secondary',
        required &&
          "after:pl-[3.25px] after:font-bold after:text-danger after:content-['*']",
        className,
      )}
      {...props}
    />
  ),
);
FormHeading.displayName = 'FormHeading';
