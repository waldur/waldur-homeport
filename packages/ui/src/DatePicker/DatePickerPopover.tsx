import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react';
import { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../BaseButton';
import { cn } from '../cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

/**
 * Open/closed state for a picker popup that can open by itself on mount
 * (`autoOpen`) — the way a table filter's select shows its menu as soon as
 * the filter is picked from "Add filter". Deferred by a frame: the trigger
 * usually sits inside another popup that is still being positioned on its
 * first render, and measuring before that would anchor the calendar to the
 * wrong spot.
 */
export const usePickerOpenState = (autoOpen?: boolean) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!autoOpen) return;
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
    // Mount only: autoOpen is about the first appearance, not later props.
  }, []);
  return [open, setOpen] as const;
};

export interface DatePickerPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Formatted value; empty shows the placeholder. */
  displayValue?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Borderless grey fill, like Metronic's `.form-control-solid`. */
  solid?: boolean;
  size?: 'sm';
  /** Shows a remove button while there is a value. */
  onClear?(): void;
  id?: string;
  style?: CSSProperties;
  /** The popup body: a Calendar, optionally with time inputs. */
  children: ReactNode;
}

/**
 * The closed state of every popup date picker: an input-styled trigger
 * showing the value (or placeholder) with a calendar icon, an optional
 * remove button, and the Radix popover the calendar opens in.
 *
 * The trigger is a button, not a read-only input: it is only ever clicked,
 * and a button gets keyboard activation and the right role for free. Its
 * look is Metronic's `.form-control`, with the values select/tailwindStyles.ts
 * pinned for the select control (height, radius, focus ring, disabled fill),
 * so a date field sits flush next to selects and text inputs.
 */
export const DatePickerPopover: FC<DatePickerPopoverProps> = ({
  open,
  onOpenChange,
  displayValue,
  placeholder,
  disabled,
  solid,
  size,
  onClear,
  id,
  style,
  children,
}) => {
  const showClear = !!onClear && !!displayValue && !disabled;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className="relative w-full" style={style}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            data-slot="date-picker-trigger"
            disabled={disabled}
            className={cn(
              // min-h keeps the height when there is no value or placeholder.
              'flex w-full items-center text-start font-normal transition-colors',
              'rounded-[8px] border-[1px] border-solid',
              size === 'sm'
                ? 'min-h-[28px] py-[4.5px] ps-[8px] pe-[32px] text-[14px]'
                : 'min-h-[40px] py-[6px] ps-[11px] pe-[40px] text-[14.3px]',
              solid
                ? 'border-transparent bg-[var(--bs-gray-100)]'
                : 'border-[var(--color-border-secondary)] bg-[var(--waldur-bg-primary)] hover:border-[var(--waldur-brand-500)]',
              // Open reads as focused while its calendar is showing.
              'outline-none focus-visible:border-[var(--waldur-brand-300)] focus-visible:ring-1 focus-visible:ring-[var(--waldur-brand-300)]',
              'data-[state=open]:border-[var(--waldur-brand-300)] data-[state=open]:ring-1 data-[state=open]:ring-[var(--waldur-brand-300)]',
              'dark:focus-visible:border-[var(--waldur-brand-400)] dark:focus-visible:ring-[var(--waldur-brand-400)]',
              'dark:data-[state=open]:border-[var(--waldur-brand-400)] dark:data-[state=open]:ring-[var(--waldur-brand-400)]',
              'disabled:cursor-not-allowed disabled:bg-[var(--waldur-bg-disabled-subtle)] disabled:hover:border-[var(--color-border-secondary)]',
            )}
          >
            {displayValue ? (
              <span
                data-slot="date-picker-value"
                className="truncate leading-normal text-[var(--surface-text-primary)]"
              >
                {displayValue}
              </span>
            ) : (
              <span
                data-slot="date-picker-placeholder"
                className="truncate leading-normal text-[var(--surface-text-secondary)]"
              >
                {placeholder}
              </span>
            )}
          </button>
        </PopoverTrigger>
        {showClear ? (
          <BaseButton
            variant="tertiary"
            size="sm"
            className="absolute top-1/2 right-[8px] -translate-y-1/2 rounded-full"
            onClick={onClear}
            tooltip={translate('Remove')}
            iconNode={<XIcon weight="bold" />}
          />
        ) : (
          <CalendarBlankIcon
            aria-hidden
            weight="bold"
            size={size === 'sm' ? 16 : 20}
            className="pointer-events-none absolute top-1/2 right-[12px] -translate-y-1/2 text-[var(--surface-text-muted)]"
          />
        )}
      </div>
      <PopoverContent
        align="start"
        className="z-[var(--z-index-picker-popover)] w-auto p-0"
        // The calendar focuses its selected day (or today) itself.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
