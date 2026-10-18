import { FieldsetHTMLAttributes, forwardRef, useContext } from 'react';

import { cn } from '../cn';

import { FieldContext } from './controlId';
import { FieldScope } from './FieldScope';

export type FormFieldsetProps = FieldsetHTMLAttributes<HTMLFieldSetElement>;

const Body = forwardRef<HTMLFieldSetElement, FormFieldsetProps>(
  ({ className, ...props }, ref) => {
    // The group's own help and error text, which no single control owns.
    const describedBy = useContext(FieldContext)?.describedBy;
    return (
      <fieldset
        ref={ref}
        className={cn('m-0 min-w-0 border-0 p-0', className)}
        {...props}
        aria-describedby={
          [props['aria-describedby'], describedBy].filter(Boolean).join(' ') ||
          undefined
        }
      />
    );
  },
);
Body.displayName = 'FormFieldsetBody';

/**
 * Groups several controls that answer one question (a start and an end, a
 * select and its custom value, a list of rows) under one name, drawn by a
 * `FormLegend`. Each control inside names itself, with a `FormField` and
 * `FormLabel` of its own or an `aria-label`: a single `<label>` cannot name
 * two controls, so the group's name goes on the fieldset, where a screen
 * reader announces it with every control inside. Help and error text written
 * with `FormText` inside the fieldset describe the fieldset, not each control.
 */
export const FormFieldset = forwardRef<HTMLFieldSetElement, FormFieldsetProps>(
  (props, ref) => (
    <FieldScope group>
      <Body ref={ref} {...props} />
    </FieldScope>
  ),
);
FormFieldset.displayName = 'FormFieldset';
