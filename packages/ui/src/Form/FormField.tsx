import { ElementType, forwardRef, HTMLAttributes } from 'react';

import { FieldScope } from './FieldScope';

export interface FormFieldProps extends HTMLAttributes<HTMLElement> {
  /**
   * A fixed id for the control inside: its `FormLabel` and the control take
   * it. Leave it out and the field links its label to the first control
   * itself; pass it when the id has to be known (a test, a selector).
   */
  controlId?: string;
  /** The element drawn, `div` by default: `td` for a table cell. */
  as?: ElementType;
}

/**
 * Groups a label, a control and its help or error text, and links the label
 * to the control. It draws no spacing; give it the margin the layout needs.
 * A field holding several controls (a list of rows) gives each its own id
 * and points the label at the first, unless `controlId` says otherwise.
 */
export const FormField = forwardRef<HTMLElement, FormFieldProps>(
  ({ controlId, as: Component = 'div', ...props }, ref) => (
    <FieldScope controlId={controlId}>
      <Component ref={ref} {...props} />
    </FieldScope>
  ),
);
FormField.displayName = 'FormField';
