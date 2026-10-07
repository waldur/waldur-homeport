import { FocusEventHandler, ReactNode, useId } from 'react';

import { cn } from '../cn';
import { HelpIcon } from '../HelpIcon';

import { CheckSize } from './checkStyles';
import { Radio } from './Radio';

export type RadioValue = string | number;

export interface RadioGroupOption<T extends RadioValue = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends RadioValue = string> {
  options: readonly RadioGroupOption<T>[];
  /** The selected option's value; anything else selects nothing. */
  value: T | null | undefined;
  onValueChange: (value: T) => void;
  /** The group's name, drawn as the fieldset's legend. */
  label?: ReactNode;
  /** A "?" after the legend. */
  tooltip?: ReactNode;
  /** Muted help text under the legend. */
  description?: ReactNode;
  /** Shared `name` of the radios; generated when omitted. */
  name?: string;
  /** `vertical` (default) stacks the options; `horizontal` wraps them in rows. */
  orientation?: 'vertical' | 'horizontal';
  size?: CheckSize;
  /** Adds a red asterisk to the legend. */
  required?: boolean;
  disabled?: boolean;
  /** Reported by every radio, for form libraries that track touched state. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  className?: string;
  'aria-label'?: string;
}

/**
 * A set of mutually exclusive options, as native radios in a `<fieldset>`
 * whose `<legend>` is the group's label — so a screen reader announces the
 * question with each option, and arrow keys move within the group.
 *
 * Options in, one value out, like `SegmentedControl`; use that one for a
 * compact row of buttons that switches a view, and this one for a form
 * question, especially when options carry descriptions. Disabling the group
 * disables every option through the fieldset.
 */
export function RadioGroup<T extends RadioValue = string>({
  options,
  value,
  onValueChange,
  label,
  tooltip,
  description,
  name,
  orientation = 'vertical',
  size = 'md',
  required,
  disabled,
  onBlur,
  onFocus,
  className,
  'aria-label': ariaLabel,
}: RadioGroupProps<T>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0', className)}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {(label || tooltip) && (
        <legend
          className={cn(
            'mb-[10px] p-0 text-[14px] font-medium leading-[20px] text-[var(--check-label)]',
            disabled && 'opacity-50',
          )}
        >
          <div className="flex items-center gap-[4px]">
            <span>
              {label}
              {required && (
                <span aria-hidden="true" className="ms-1 text-danger">
                  *
                </span>
              )}
            </span>
            {tooltip && <HelpIcon label={tooltip} />}
          </div>
        </legend>
      )}
      {description && (
        <p className="-mt-[6px] mb-[10px] text-[14px] leading-[20px] text-[var(--check-description)]">
          {description}
        </p>
      )}
      <div
        className={cn(
          orientation === 'horizontal'
            ? 'flex flex-wrap gap-x-[24px] gap-y-[8px]'
            : 'flex flex-col gap-[8px]',
        )}
      >
        {options.map((option) => (
          <Radio
            key={String(option.value)}
            name={groupName}
            value={String(option.value)}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled || option.disabled}
            size={size}
            label={option.label}
            description={option.description}
            tooltip={option.tooltip}
            inline={orientation === 'horizontal'}
          />
        ))}
      </div>
    </fieldset>
  );
}
