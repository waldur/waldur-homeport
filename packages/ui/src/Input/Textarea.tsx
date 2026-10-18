import { forwardRef, TextareaHTMLAttributes } from 'react';

import { cn } from '../cn';
import { useControlId, useDescribedBy } from '../Form/controlId';

import { InputSize, textareaVariants } from './inputStyles';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** `md` by default; `sm` for dense rows. */
  size?: InputSize;
  /** A filled field (`bg-tertiary`) instead of the outlined one. */
  solid?: boolean;
  /** Draws the error state and sets `aria-invalid`. */
  invalid?: boolean;
}

/**
 * A multi-line text input with the same look as `Input`. Resizable
 * vertically; pass `className="resize-none"` to fix its height.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size, solid, invalid, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ size, solid }), className)}
      {...props}
      id={useControlId(props.id)}
      aria-describedby={useDescribedBy(props['aria-describedby'])}
      aria-invalid={invalid ? true : props['aria-invalid']}
    />
  ),
);
Textarea.displayName = 'Textarea';
