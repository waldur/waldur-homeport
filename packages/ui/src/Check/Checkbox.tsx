import {
  ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useId,
  useRef,
} from 'react';

import { cn } from '../cn';

import {
  CheckLabel,
  CheckLabelProps,
  hasCheckLabel,
  LabelledInputProps,
  mergeDescribedBy,
} from './CheckLabel';
import { CheckMark } from './CheckMark';
import {
  BOX_RADIUS,
  BOX_SIZE,
  BOX_VISUAL,
  BOX_WRAPPER,
  CHECKBOX_VISUAL,
  CheckSize,
  HIDDEN_INPUT,
  MARK_BASE,
} from './checkStyles';

export interface CheckboxProps
  extends
    Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'size'>,
    CheckLabelProps {
  /** `md` (20px, default) or `sm` (16px). */
  size?: CheckSize;
  /**
   * Shows a dash instead of a check, for a "select all" box when only some
   * rows are selected. A DOM property, not an attribute, so it is set here.
   */
  indeterminate?: boolean;
  /** The new state, as a boolean. Native `onChange` still fires too. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * A checkbox: a native `<input type="checkbox">`, invisible and on top (it
 * takes clicks, focus and form state), over a drawn box, check and dash that
 * follow its state with `peer-*` (see checkStyles.ts).
 *
 * With `label` (or `description`/`tooltip`) it renders the whole row, with
 * a `<label htmlFor>` naming the input; without, the bare box, for tables and custom layouts (give
 * it an `aria-label`). `className` and `hidden` go on the outermost element;
 * `ref`, `id`, `checked`, `onChange`, `aria-*` and `data-*` reach the input.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      indeterminate,
      onCheckedChange,
      onChange,
      className,
      hidden,
      label,
      description,
      tooltip,
      align,
      inline,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);
    const autoId = useId();
    const inputId = props.id ?? autoId;
    const box = (boxClassName?: string, inputProps?: LabelledInputProps) => (
      <span
        className={cn(BOX_WRAPPER, BOX_SIZE[size], boxClassName)}
        hidden={hidden}
      >
        <input
          ref={innerRef}
          type="checkbox"
          className={HIDDEN_INPUT}
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
          {...props}
          {...mergeDescribedBy(props, inputProps)}
        />
        <span
          aria-hidden="true"
          className={cn(BOX_VISUAL, CHECKBOX_VISUAL, BOX_RADIUS[size])}
        />
        {/* The legacy marks, at their legacy 70% of the box. A checked box
            that is also indeterminate shows the dash, as browsers do. */}
        <CheckMark
          className={cn(
            MARK_BASE,
            'w-[70%] peer-checked:block peer-indeterminate:hidden',
          )}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={cn(MARK_BASE, 'w-[70%] peer-indeterminate:block')}
        >
          <path
            d="M6 10h8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
    if (!hasCheckLabel({ label, description, tooltip })) {
      return box(className);
    }
    return (
      <CheckLabel
        control={box}
        inputId={inputId}
        label={label}
        description={description}
        tooltip={tooltip}
        align={align}
        inline={inline}
        disabled={props.disabled}
        size={size}
        className={cn(hidden && 'hidden', className)}
      />
    );
  },
);
Checkbox.displayName = 'Checkbox';
