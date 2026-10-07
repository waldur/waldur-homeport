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
  BOX_SIZE,
  BOX_VISUAL,
  BOX_WRAPPER,
  CheckSize,
  HIDDEN_INPUT,
  MARK_BASE,
} from './checkStyles';

export interface RadioProps
  extends
    Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'size'>,
    CheckLabelProps {
  /** `md` (20px, default) or `sm` (16px). */
  size?: CheckSize;
}

/**
 * A radio: the same invisible native input over a drawn circle and dot as
 * `Checkbox`, with the same label props and prop split. For a whole set of
 * options use `RadioGroup`, which names and labels the group; a lone `Radio`
 * is for layouts it does not cover (a radio per table row).
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size = 'md',
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
    const autoId = useId();
    const inputId = props.id ?? autoId;
    const box = (boxClassName?: string, inputProps?: LabelledInputProps) => (
      <span
        className={cn(BOX_WRAPPER, BOX_SIZE[size], boxClassName)}
        hidden={hidden}
      >
        <input
          ref={ref}
          type="radio"
          className={HIDDEN_INPUT}
          {...props}
          {...mergeDescribedBy(props, inputProps)}
        />
        <span aria-hidden="true" className={cn(BOX_VISUAL, 'rounded-full')} />
        {/* Half the box, as the legacy dot (r=2 in an 8-unit viewBox). */}
        <span
          aria-hidden="true"
          className={cn(
            MARK_BASE,
            'size-1/2 rounded-full bg-current peer-checked:block',
          )}
        />
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
Radio.displayName = 'Radio';
