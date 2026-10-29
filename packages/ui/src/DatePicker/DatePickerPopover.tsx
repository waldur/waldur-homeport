import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react';
import type { DateTime } from 'luxon';
import {
  ChangeEvent,
  CSSProperties,
  FC,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../Button';
import { cn } from '../cn';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '../Popover';

import type { EntryResult } from './dateEntry';
import { KeepInputFocusContext } from './keepInputFocus';
import {
  DateMask,
  MASK_HINTS,
  applyMask,
  browserDateOrder,
  caretAfterDigits,
  digitsOf,
  formatDigits,
  isRegionalEntry,
} from './maskedDate';

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

/**
 * The text of one picker input: the value, formatted, until the user types;
 * then their entry, until it is committed or the value changes from outside.
 * A refused entry stays on screen with its message — also when refusing it
 * empties the value, which would otherwise read as a change from outside.
 */
export const useEntryText = (formatted: string) => {
  const [text, setText] = useState(formatted);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(formatted);
  const [keepOnEmpty, setKeepOnEmpty] = useState(false);
  if (formatted !== synced) {
    setSynced(formatted);
    setKeepOnEmpty(false);
    if (!(keepOnEmpty && formatted === '')) {
      setText(formatted);
      setError(null);
    }
  }
  return {
    text,
    error,
    /**
     * Typed but not yet committed — or refused, so that emptying a refused
     * entry commits again and drops its message.
     */
    dirty: text !== formatted || error !== null,
    type: setText,
    /** Shows `next` (the committed value, formatted) and drops any error. */
    accept: (next: string) => {
      setText(next);
      setError(null);
    },
    /** Reports the entry; pass `emptiesValue` when the value is about to be cleared. */
    refuse: (message: string, emptiesValue = false) => {
      setError(message);
      if (emptiesValue) setKeepOnEmpty(true);
    },
    /** Keeps this entry while a sibling input clears the shared value. */
    keep: () => setKeepOnEmpty(true),
  };
};

export type EntryText = ReturnType<typeof useEntryText>;

/** Tells the caller (the form's FormGroup) when a refused entry is shown. */
export const useReportEntryError = (
  error: string | null,
  onEntryErrorChange?: (message: string | null) => void,
) => {
  useEffect(() => {
    onEntryErrorChange?.(error);
  }, [error, onEntryErrorChange]);
};

/**
 * Commits a single-value picker's entry: empty clears the value; a refused
 * entry stays on screen with its message and empties the value, so a stale
 * date is never submitted under an error; an accepted one is shown in the
 * canonical format and emitted if it differs from `value`.
 */
export const commitSingleEntry = ({
  entry,
  result,
  value,
  onChange,
  format,
  resolve,
}: {
  entry: EntryText;
  result: EntryResult;
  value: Date | null | undefined;
  onChange(value: Date | null): void;
  /** Luxon format the accepted value is shown in. */
  format: string;
  /** The value an accepted entry stands for (a time added, a day's start). */
  resolve(entry: { value: DateTime; hasTime: boolean }): DateTime;
}) => {
  if (result.status === 'ok') {
    const next = resolve(result);
    entry.accept(next.toFormat(format));
    if (!value || next.toMillis() !== value.getTime()) {
      onChange(next.toJSDate());
    }
    return;
  }
  if (result.status === 'empty') entry.accept('');
  else entry.refuse(result.message, !!value);
  if (value) onChange(null);
};

/** What an empty input shows: `YYYY-MM-DD`, `YYYY-MM`, … */
export const formatPlaceholder = (mask: DateMask) => MASK_HINTS[mask];

export const formatHint = (mask: DateMask) =>
  translate('Format: {format}', { format: MASK_HINTS[mask] }) as string;

interface DateEntryInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'size'
> {
  mask: DateMask;
  value: string;
  onValueChange(text: string): void;
  /** Enter or leaving the input with an uncommitted entry. */
  onCommit(): void;
  dirty: boolean;
  /** Alt+ArrowDown, the combobox convention for opening the popup. */
  onOpenCalendar(): void;
}

/**
 * A picker's text input: digits only, with the separators of `mask` put in
 * as they are typed, and a pasted ISO date reformatted to it. Typing never
 * opens the calendar.
 */
export const DateEntryInput: FC<DateEntryInputProps> = ({
  mask,
  value,
  onValueChange,
  onCommit,
  dirty,
  onOpenCalendar,
  className,
  onKeyDown,
  onBlur,
  ...rest
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    if (caret !== null && ref.current === document.activeElement) {
      ref.current.setSelectionRange(caret, caret);
    }
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    let digitsBefore = digitsOf(raw.slice(0, caret)).length;
    const order = browserDateOrder();
    // An entry in the locale's own order is left as typed, separators and
    // all, so editing it works like any text field.
    const regional = isRegionalEntry(raw, order);
    let next = applyMask(raw, mask, order);
    // Backspace or Delete over a separator inside the entry: the mask would
    // put it straight back, so delete the digit beyond it instead — the one
    // before the caret for Backspace, after it for Delete.
    if (
      !regional &&
      raw.length < value.length &&
      caret < raw.length &&
      digitsOf(raw) === digitsOf(value)
    ) {
      const digits = digitsOf(raw);
      const forward =
        (event.nativeEvent as InputEvent).inputType === 'deleteContentForward';
      const removed = forward ? digitsBefore : digitsBefore - 1;
      next = formatDigits(
        digits.slice(0, removed) + digits.slice(removed + 1),
        mask,
      );
      if (!forward) digitsBefore -= 1;
    }
    const nextCaret =
      caret >= raw.length
        ? next.length
        : regional && next === raw
          ? caret
          : caretAfterDigits(next, digitsBefore);
    if (next === value) {
      // A refused keystroke (a letter, a digit past the end) leaves the
      // state as it was, so React only puts the old text back, which moves
      // the caret to the end. Put it back where it was once React is done.
      queueMicrotask(() => {
        if (ref.current === document.activeElement) {
          ref.current.setSelectionRange(nextCaret, nextCaret);
        }
      });
      return;
    }
    pendingCaret.current = nextCaret;
    onValueChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' && dirty) {
      // Commit, without submitting a surrounding form.
      event.preventDefault();
      onCommit();
    } else if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      onOpenCalendar();
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      data-slot="date-picker-input"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        onBlur?.(event);
        if (dirty) onCommit();
      }}
      className={cn(
        'w-full min-w-0 flex-1 border-0 bg-transparent p-0 leading-normal text-primary outline-none',
        'placeholder:text-quaternary disabled:cursor-not-allowed',
        'text-sm',
        className,
      )}
      {...rest}
    />
  );
};

export interface DatePickerPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** The text input(s): one DateEntryInput, or two for a range. */
  inputs: ReactNode;
  /** The format, read out with the inputs (by `hintId`); hidden on screen. */
  hint: string;
  hintId: string;
  /** Messages for refused entries; each input references its own by id. */
  errors?: Array<{ id: string; message: string }>;
  /** Paints the field as invalid (a refused entry, or the form's error). */
  invalid?: boolean;
  disabled?: boolean;
  /** Borderless grey fill, like Metronic's `.form-control-solid`. */
  solid?: boolean;
  size?: 'sm';
  /** Shows a remove button while `showClear`. */
  onClear?(): void;
  showClear?: boolean;
  /** Accessible name of the calendar button ("Choose date"). */
  triggerLabel: string;
  /** Accessible name of the popup dialog. */
  dialogLabel: string;
  /** Focus left the field — inputs, buttons and popup — while it is closed. */
  onBlur?(): void;
  /** Names the box as a group, for the range picker's two inputs. */
  group?: { 'aria-label'?: string; 'aria-labelledby'?: string };
  style?: CSSProperties;
  /** The popup body: a Calendar, optionally with time inputs. */
  children: ReactNode;
}

/**
 * The closed state of every popup date picker: a text input to type the
 * date into — the primary control — with a calendar button beside it that
 * opens the calendar as a secondary aid, an optional remove button, and any
 * message for a refused entry below. The expected format is the empty
 * input's placeholder, and is read out with the input from a hidden hint.
 *
 * The box looks like Metronic's `.form-control`, with the values
 * select/tailwindStyles.ts pins for the select control (height, radius,
 * focus ring, disabled fill), so a date field sits flush next to selects
 * and text inputs. The popup anchors to the whole box, not the button.
 */
export const DatePickerPopover: FC<DatePickerPopoverProps> = ({
  open,
  onOpenChange,
  inputs,
  hint,
  hintId,
  errors = [],
  invalid,
  disabled,
  solid,
  size,
  onClear,
  showClear,
  triggerLabel,
  dialogLabel,
  onBlur,
  group,
  style,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  // Set while the popup was opened by focusing an input: focus then stays in
  // the input, so the user can keep typing with the calendar showing.
  const [keepInputFocus, setKeepInputFocus] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setKeepInputFocus(false);
    onOpenChange(next);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (
      open ||
      disabled ||
      !(event.target as Element).matches('[data-slot="date-picker-input"]')
    ) {
      return;
    }
    setKeepInputFocus(true);
    onOpenChange(true);
  };

  // The remove button disappears with the value, so focus would fall to the
  // page (and read as leaving the field). Move it to the first input first.
  const handleClear = () => {
    fieldRef.current
      ?.querySelector<HTMLInputElement>('[data-slot="date-picker-input"]')
      ?.focus();
    onClear?.();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (
      open ||
      (next &&
        (event.currentTarget.contains(next) ||
          contentRef.current?.contains(next)))
    ) {
      return;
    }
    onBlur?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div
        data-slot="date-picker"
        className="w-full"
        style={style}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <PopoverAnchor asChild>
          <div
            {...(group ? { role: 'group', ...group } : {})}
            ref={fieldRef}
            data-slot="date-picker-field"
            data-invalid={invalid || undefined}
            className={cn(
              'flex w-full items-center gap-[4px] font-normal transition-colors',
              'rounded-lg border-[1px] border-solid',
              size === 'sm'
                ? 'min-h-[28px] ps-[8px] pe-[2px]'
                : 'min-h-[40px] ps-[11px] pe-[4px]',
              solid
                ? 'border-transparent bg-tertiary'
                : // eslint-disable-next-line waldur-custom/require-dark-pair -- a hover edge: brand-500 is 3.6:1 on the dark field, over the 3:1 non-text minimum
                  'border-secondary bg-primary hover:border-brand-500',
              // Open reads as focused while its calendar is showing.
              'focus-within:border-[var(--border-brand)] focus-within:ring-1 focus-within:ring-[var(--border-brand)]',
              open &&
                'border-[var(--border-brand)] ring-1 ring-[var(--border-brand)]',
              invalid &&
                'border-danger hover:border-danger focus-within:border-danger',
              disabled &&
                'cursor-not-allowed bg-secondary hover:border-secondary',
            )}
          >
            {inputs}
            {showClear && onClear && !disabled ? (
              <BaseButton
                variant="text-secondary"
                size="sm"
                className={size === 'sm' ? 'size-[24px]' : undefined}
                onClick={handleClear}
                tooltip={translate('Clear')}
                iconNode={<XIcon weight="bold" />}
              />
            ) : null}
            <PopoverTrigger asChild>
              <BaseButton
                variant="text-secondary"
                size="sm"
                data-slot="date-picker-trigger"
                className={cn(
                  'shrink-0',
                  size === 'sm' ? 'size-[24px]' : 'size-[32px]',
                )}
                disabled={disabled}
                tooltip={triggerLabel}
                iconNode={<CalendarBlankIcon weight="bold" />}
              />
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        {/* For screen readers only: on screen, the format is the empty
            input's placeholder and the value itself. */}
        <div id={hintId} data-slot="date-picker-hint" className="sr-only">
          {hint}
        </div>
        {errors.map((error) => (
          <div
            key={error.id}
            id={error.id}
            data-slot="date-picker-error"
            className="mt-[4px] text-xs leading-[16px] text-danger"
          >
            {error.message}
          </div>
        ))}
      </div>
      <PopoverContent
        ref={contentRef}
        align="start"
        aria-label={dialogLabel}
        // Scrolls inside the space Radix measures rather than growing
        // past the bottom of the screen.
        className="z-picker-popover max-h-(--radix-popover-content-available-height) overflow-y-auto"
        // Clicking or tabbing between the field's own inputs is not leaving.
        onInteractOutside={(event) => {
          if (fieldRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
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
        // Focus the day react-day-picker marks as focused (the selected day,
        // or today), not Radix's first focusable, the previous-month arrow.
        // The calendar also focuses it itself, from an effect, but inside a
        // modal dialog that runs before this popover's focus scope pauses
        // the dialog's trap, which pulls focus straight back. Radix fires
        // this once the scope is in place.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (keepInputFocus) return;
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLElement>('[data-focused="true"] button')
            ?.focus();
        }}
      >
        <KeepInputFocusContext.Provider value={keepInputFocus}>
          {children}
        </KeepInputFocusContext.Provider>
      </PopoverContent>
    </Popover>
  );
};

/** Joins id references, skipping empty ones; `undefined` when none remain. */
export const joinIds = (...ids: Array<string | false | null | undefined>) =>
  ids.filter(Boolean).join(' ') || undefined;
