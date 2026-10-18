import { forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '../cn';
import { useControlId, useDescribedBy } from '../Form/controlId';

import { InputSize, inputVariants } from './inputStyles';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** `md` (40px tall) by default; `sm` for dense rows and toolbars. */
  size?: InputSize;
  /** A filled field (`bg-tertiary`) instead of the outlined one. */
  solid?: boolean;
  /** Draws the error state and sets `aria-invalid`. */
  invalid?: boolean;
  /** The native `size` attribute (width in characters). */
  htmlSize?: number;
}

/**
 * A single-line text input: text, email, password, number, search, tel, url.
 * A plain controlled-or-uncontrolled `<input>` with the shared input look, so
 * it takes every native prop and a ref.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { size, solid, invalid, htmlSize, className, type = 'text', ...props },
    ref,
  ) => (
    <input
      ref={ref}
      type={type}
      size={htmlSize}
      className={cn(inputVariants({ size, solid }), className)}
      {...props}
      id={useControlId(props.id)}
      aria-describedby={useDescribedBy(props['aria-describedby'])}
      aria-invalid={invalid ? true : props['aria-invalid']}
    />
  ),
);
Input.displayName = 'Input';
