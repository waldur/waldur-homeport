import { CaretDownIcon } from '@phosphor-icons/react';
import { forwardRef, SelectHTMLAttributes } from 'react';

import { cn } from '../cn';
import { useControlId, useDescribedBy } from '../Form/controlId';

import { InputGroup } from './InputGroup';
import { InputSize, selectVariants } from './inputStyles';

export interface NativeSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  /** `md` (40px tall) by default. */
  size?: InputSize;
  /** A filled field (`bg-tertiary`) instead of the outlined one. */
  solid?: boolean;
  /** Draws the error state and sets `aria-invalid`. */
  invalid?: boolean;
  /** Shrinks to its widest option instead of filling the row. */
  fit?: boolean;
  /** Classes for the wrapper that holds the caret: margins and widths that
   * place the field in its row. `className` goes on the `<select>`. */
  containerClassName?: string;
}

/**
 * The browser's own `<select>` -- its popup, keyboard and mobile picker --
 * drawn like an Input, with a caret icon in place of the native arrow.
 * `<option>` and `<optgroup>` children are passed through as they are. For a
 * searchable or multi-value list use `Select`.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      size,
      solid,
      invalid,
      fit,
      className,
      containerClassName,
      children,
      ...props
    },
    ref,
  ) => (
    <InputGroup
      invalid={invalid}
      className={cn(fit && 'w-fit', containerClassName)}
      end={
        <CaretDownIcon
          aria-hidden
          size={16}
          weight="bold"
          className="ml-[4px] shrink-0 text-tertiary"
        />
      }
    >
      <select
        ref={ref}
        className={cn(
          selectVariants({ size, solid }),
          // The caret sits 12px from the edge at every size, so the text clears
          // it by the same amount whatever the field's own padding.
          'pr-[calc(12px+var(--input-end,0px))]',
          fit && 'w-auto',
          className,
        )}
        {...props}
        id={useControlId(props.id)}
        aria-describedby={useDescribedBy(props['aria-describedby'])}
        aria-invalid={invalid ? true : props['aria-invalid']}
      >
        {children}
      </select>
    </InputGroup>
  ),
);
NativeSelect.displayName = 'NativeSelect';
