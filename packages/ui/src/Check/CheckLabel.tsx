import { ReactNode } from 'react';

import { cn } from '../cn';

import { CheckHelp } from './CheckHelp';
import { CheckSize } from './checkStyles';

/** The label props every check control (Checkbox, Radio, Switch) takes. */
export interface CheckLabelProps {
  /** Text beside the control. Without it the control renders bare. */
  label?: ReactNode;
  /** Muted help text under the label. */
  description?: ReactNode;
  /** A "?" after the label that explains it on hover or focus. */
  tooltip?: ReactNode;
  /**
   * `start` lines the control up with the label's first line, so it stays
   * put when the label wraps; `center` centres it on the whole text block.
   * Defaults to `start`, except a Switch without a description, which is
   * taller than one line of text and centres on it.
   */
  align?: 'start' | 'center';
  /** `inline-flex` instead of a full-width row. */
  inline?: boolean;
}

/**
 * The shared label row: control first, then the label (and tooltip) over the
 * description, 8px apart. The label is a `<label htmlFor>` naming the
 * control; the description is linked with `aria-describedby`, so it is read
 * as help text rather than as part of the control's name. Replaces
 * Bootstrap's `.form-check` + `.form-check-label` and Metronic's
 * `.form-check-custom`.
 *
 * Internal to Checkbox, Radio and Switch; callers pass `label` to those.
 */
export function CheckLabel({
  control,
  inputId,
  defaultAlign = 'start',
  label,
  description,
  tooltip,
  align,
  inline,
  disabled,
  size,
  className,
}: CheckLabelProps & {
  control: (
    boxClassName: string | undefined,
    inputProps: LabelledInputProps,
  ) => ReactNode;
  inputId: string;
  /** The control's own default for `align`. */
  defaultAlign?: 'start' | 'center';
  disabled?: boolean;
  /** A 16px control in `align="start"` drops 2px to centre on the 20px first line. */
  size?: CheckSize;
  className?: string;
}) {
  const resolvedAlign = align ?? defaultAlign;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        'gap-[8px]',
        resolvedAlign === 'center' ? 'items-center' : 'items-start',
        className,
      )}
    >
      {control(
        resolvedAlign === 'start' && size === 'sm' ? 'mt-[2px]' : undefined,
        { id: inputId, 'aria-describedby': descriptionId },
      )}
      <div className="flex min-w-0 flex-col gap-[2px]">
        {(label || tooltip) && (
          // The tooltip trigger sits beside the <label>, not in it: a button
          // inside a label is a second labelled control, and clicking it
          // would toggle the checkbox.
          <div className="flex items-center gap-[4px]">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'm-0 text-[14px] leading-[20px]',
                  disabled
                    ? 'cursor-not-allowed text-[var(--check-label-disabled)]'
                    : 'cursor-pointer text-[var(--check-label)]',
                )}
              >
                {label}
              </label>
            )}
            {tooltip && <CheckHelp tooltip={tooltip} />}
          </div>
        )}
        {description && (
          <div
            id={descriptionId}
            className={cn(
              'text-[14px] leading-[20px]',
              disabled
                ? 'text-[var(--check-label-disabled)]'
                : 'text-[var(--check-description)]',
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

/** True when any label prop is set, so the control renders inside CheckLabel. */
export const hasCheckLabel = ({
  label,
  description,
  tooltip,
}: CheckLabelProps) => Boolean(label || description || tooltip);

/** What CheckLabel hands the input: the id its label points at, and the description's id. */
export interface LabelledInputProps {
  id: string;
  'aria-describedby'?: string;
}

/** The labelled input's id and describedby, keeping any describedby the caller set. */
export const mergeDescribedBy = (
  props: { 'aria-describedby'?: string },
  inputProps?: LabelledInputProps,
) =>
  inputProps
    ? {
        id: inputProps.id,
        'aria-describedby':
          [props['aria-describedby'], inputProps['aria-describedby']]
            .filter(Boolean)
            .join(' ') || undefined,
      }
    : {};
