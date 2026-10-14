import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react';
import { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../Button';
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
                ? 'border-transparent bg-tertiary'
                : // eslint-disable-next-line waldur-custom/require-dark-pair -- a hover edge: brand-500 is 3.6:1 on the dark field, over the 3:1 non-text minimum
                  'border-secondary bg-primary hover:border-brand-500',
              // Open reads as focused while its calendar is showing.
              'outline-none focus-visible:border-[var(--border-brand)] focus-visible:ring-1 focus-visible:ring-[var(--border-brand)]',
              'data-[state=open]:border-[var(--border-brand)] data-[state=open]:ring-1 data-[state=open]:ring-[var(--border-brand)]',
              'disabled:cursor-not-allowed disabled:bg-secondary disabled:hover:border-secondary',
            )}
          >
            {displayValue ? (
              <span
                data-slot="date-picker-value"
                className="truncate leading-normal text-primary"
              >
                {displayValue}
              </span>
            ) : (
              <span
                data-slot="date-picker-placeholder"
                className="truncate leading-normal text-quaternary"
              >
                {placeholder}
              </span>
            )}
          </button>
        </PopoverTrigger>
        {showClear ? (
          <BaseButton
            variant="text-secondary"
            size="sm"
            className="absolute top-1/2 right-[8px] -translate-y-1/2"
            onClick={onClear}
            tooltip={translate('Clear')}
            iconNode={<XIcon weight="bold" />}
          />
        ) : (
          <CalendarBlankIcon
            aria-hidden
            weight="bold"
            size={size === 'sm' ? 16 : 20}
            className="pointer-events-none absolute top-1/2 right-[12px] -translate-y-1/2 text-quinary"
          />
        )}
      </div>
      <PopoverContent
        align="start"
        // Scrolls inside the space Radix measures rather than growing
        // past the bottom of the screen.
        className="z-picker-popover max-h-(--radix-popover-content-available-height) overflow-y-auto"
        // Focus the day react-day-picker marks as focused (the selected day,
        // or today), not Radix's first focusable, the previous-month arrow.
        // The calendar also focuses it itself, from an effect, but inside a
        // modal dialog that runs before this popover's focus scope pauses
        // the dialog's trap, which pulls focus straight back. Radix fires
        // this once the scope is in place.
        // Escape in a caption dropdown's option grid closes just the grid.
        onEscapeKeyDown={(event) => {
          if (
            (event.target as Element | null)?.closest?.(
              '[data-slot="calendar-dropdown-panel"]',
            )
          ) {
            event.preventDefault();
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLElement>('[data-focused="true"] button')
            ?.focus();
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
