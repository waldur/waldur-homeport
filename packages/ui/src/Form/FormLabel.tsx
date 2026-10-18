import { forwardRef, LabelHTMLAttributes } from 'react';

import { cn } from '../cn';

import { useFieldLabelFor } from './FieldScope';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds the red asterisk. The control itself carries `required`. */
  required?: boolean;
}

/**
 * A field's label: 14px, medium, `text-secondary`, with the gap above its
 * control. Points at the enclosing `FormField`'s control (its `controlId`, or
 * else its first control) unless `htmlFor` says otherwise. Sizes are px, not rem, so the label is the same in
 * waldur-homeport (13px root) and the micro-apps (16px root).
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ required, className, htmlFor, ...props }, ref) => {
    const target = useFieldLabelFor(htmlFor);
    return (
      <label
        ref={ref}
        htmlFor={target}
        className={cn(
          'mb-[6.5px] inline-block text-sm leading-[20px] font-medium text-secondary',
          required &&
            "after:pl-[3.25px] after:font-bold after:text-danger after:content-['*']",
          className,
        )}
        {...props}
      />
    );
  },
);
FormLabel.displayName = 'FormLabel';
