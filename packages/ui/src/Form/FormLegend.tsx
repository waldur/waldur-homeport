import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '../cn';

export interface FormLegendProps extends HTMLAttributes<HTMLLegendElement> {
  /** Adds the red asterisk. */
  required?: boolean;
}

/**
 * The name of a `FormFieldset`, drawn like a `FormLabel`: 14px, medium,
 * `text-secondary`, with the gap above the controls.
 */
export const FormLegend = forwardRef<HTMLLegendElement, FormLegendProps>(
  ({ required, className, ...props }, ref) => (
    <legend
      ref={ref}
      className={cn(
        'float-none mb-[6.5px] w-auto p-0 text-sm leading-[20px] font-medium text-secondary',
        required &&
          "after:pl-[3.25px] after:font-bold after:text-danger after:content-['*']",
        className,
      )}
      {...props}
    />
  ),
);
FormLegend.displayName = 'FormLegend';
