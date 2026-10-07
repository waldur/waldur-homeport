import { ComponentPropsWithoutRef, forwardRef, useId } from 'react';

import { cn } from '../cn';

import {
  CheckLabel,
  CheckLabelProps,
  hasCheckLabel,
  LabelledInputProps,
  mergeDescribedBy,
} from './CheckLabel';
import {
  CheckSize,
  HIDDEN_INPUT,
  SWITCH_KNOB,
  SWITCH_KNOB_SIZE,
  SWITCH_SIZE,
  SWITCH_TRACK,
  SWITCH_WRAPPER,
} from './checkStyles';

export interface SwitchProps
  extends
    Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'onChange' | 'checked' | 'size'
    >,
    CheckLabelProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** `md` (44×24, default) or `sm` (36×20). */
  size?: CheckSize;
}

/**
 * An on/off toggle: a native `<input type="checkbox">`, invisible and on
 * top, over a drawn track and knob that follow its state with `peer-*`
 * (see checkStyles.ts). It keeps checkbox semantics.
 *
 * With `label` (or `description`/`tooltip`) it renders the whole row, in one
 * `<label>`, inline by default as the legacy switches were; without, the bare
 * switch (give it an `aria-label`). `className` and `hidden` go on the
 * outermost element; `ref`, `id`, `checked`, `aria-*` and `data-*` reach the
 * input. Sizes are the legacy `.form-switch` (44×24) and `.form-switch-sm`
 * (36×20) at the app's 13px root font-size; colours come from
 * waldur-design-tokens/checkColors.css.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      size = 'md',
      className,
      hidden,
      label,
      description,
      tooltip,
      align,
      inline = true,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = props.id ?? autoId;
    const control = (
      boxClassName?: string,
      inputProps?: LabelledInputProps,
    ) => (
      <span
        className={cn(SWITCH_WRAPPER, SWITCH_SIZE[size], boxClassName)}
        hidden={hidden}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          className={HIDDEN_INPUT}
          {...props}
          {...mergeDescribedBy(props, inputProps)}
        />
        <span aria-hidden="true" className={SWITCH_TRACK} />
        <span
          aria-hidden="true"
          className={cn(SWITCH_KNOB, SWITCH_KNOB_SIZE[size])}
        />
      </span>
    );
    if (!hasCheckLabel({ label, description, tooltip })) {
      return control(className);
    }
    return (
      <CheckLabel
        control={control}
        inputId={inputId}
        defaultAlign={description ? 'start' : 'center'}
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
Switch.displayName = 'Switch';

/**
 * The switch's look on its own, with no input: for a control that already
 * has its own semantics, such as Menu.CheckboxItem (role="menuitemcheckbox").
 * Same tokens and the `sm` size of Switch.
 */
export function SwitchVisual({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-full border-[1px] border-solid transition-colors duration-150 ease-[ease-in-out] motion-reduce:transition-none',
        checked
          ? 'border-[var(--switch-track-checked)] bg-[var(--switch-track-checked)]'
          : 'border-[var(--switch-track-border)] bg-[var(--switch-track)]',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block size-[16px] rounded-full bg-[var(--switch-knob)] transition-transform duration-150 ease-[ease-in-out] motion-reduce:transition-none',
          // Switch's knob, with no input to read state from.
          checked
            ? 'translate-x-[17px] [box-shadow:0_1px_2px_rgb(16_24_40/0.06)]'
            : 'translate-x-[1px] [box-shadow:0_0_0_1px_var(--switch-knob-border),0_1px_2px_rgb(16_24_40/0.06)]',
        )}
      />
    </span>
  );
}
