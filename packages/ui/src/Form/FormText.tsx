import { ElementType, forwardRef, HTMLAttributes } from 'react';

import { cn } from '../cn';

import { useDescriptionId } from './controlId';

export type FormTextVariant = 'default' | 'muted' | 'danger' | 'warning';

const VARIANTS: Record<FormTextVariant, string> = {
  default: 'text-tertiary',
  muted: 'text-quaternary',
  danger: 'text-danger',
  warning: 'text-warning',
};

export interface FormTextProps extends HTMLAttributes<HTMLElement> {
  /** `small` by default; `div` or `p` when it holds blocks. */
  as?: ElementType;
  /**
   * The colour: `default` for help, `muted` for a quieter note, `danger` for
   * an error and `warning` for a caution.
   */
  variant?: FormTextVariant;
}

/**
 * Help or error text under a control: 14px, a block with a gap above it,
 * coloured by `variant`. The controls in the same `FormField` point at it
 * with `aria-describedby`.
 */
export const FormText = forwardRef<HTMLElement, FormTextProps>(
  (
    { as: Component = 'small', variant = 'default', className, id, ...props },
    ref,
  ) => (
    <Component
      ref={ref}
      id={useDescriptionId(id)}
      className={cn(
        'mt-[6.5px] block text-sm leading-[14px] font-normal',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  ),
);
FormText.displayName = 'FormText';
