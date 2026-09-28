import * as RadioGroup from '@radix-ui/react-radio-group';
import {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';

import { type ButtonSize } from './BaseButton';
import {
  segmentedItemClassName,
  segmentedListClassName,
  type SegmentedVariant,
} from './segmentedStyles';

/** Radix reports every value as a string; numeric options (months, days) round-trip through `String()` and come back as the caller's own type. */
export type SegmentedValue = string | number;

export interface SegmentedControlOption<T extends SegmentedValue = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<
  T extends SegmentedValue = string,
> extends Omit<
  ComponentPropsWithoutRef<typeof RadioGroup.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  /** Only ever called with a different option's value. */
  onValueChange: (value: T) => void;
  size?: ButtonSize;
  /** `neutral` (default) or `brand` — see SegmentedVariant. */
  variant?: SegmentedVariant;
  /** Stretch to the container, splitting the width evenly between segments. */
  fullWidth?: boolean;
  /** Extra classes on every segment, e.g. `px-6` for wider hit targets. */
  itemClassName?: string;
}

/**
 * A row of mutually exclusive options that changes what a view *shows* rather
 * than where the user *is* — a lens, not navigation. Use tabs (with panels)
 * when each option owns a region of the page, and a select when there are too
 * many options to lay out side by side.
 *
 * On Radix RadioGroup, so it behaves like a native radio group: Tab enters at
 * the checked segment and leaves in one stop, and the arrow keys move *and
 * select* (Space selects the focused one).
 *
 * A radio cannot be un-checked, so `onValueChange` only ever reports a change
 * to a different option.
 *
 * Segments are `buttonVariants({ variant: 'tertiary' })`, so they track the
 * button design tokens; the checked one takes the tertiary *pressed* fill.
 * Borders are inset shadows (see buttonVariants), so neighbours overlap by 1px
 * to render a single shared line, and the focused/checked segment is lifted
 * above its neighbours so its ring and border are not clipped.
 *
 * `ref` reaches the radiogroup element. Callers that need to put focus on the
 * checked segment after the control remounts can do so through
 * `ref.current.querySelector('[role="radio"][aria-checked="true"]')`.
 */
function SegmentedControlImpl<T extends SegmentedValue>(
  {
    options,
    value,
    onValueChange,
    size = 'md',
    variant = 'neutral',
    fullWidth,
    itemClassName,
    className,
    ...rest
  }: SegmentedControlProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <RadioGroup.Root
      orientation="horizontal"
      {...rest}
      ref={ref}
      value={String(value)}
      onValueChange={(next) => {
        const chosen = options.find((option) => String(option.value) === next);
        if (chosen && chosen.value !== value) {
          onValueChange(chosen.value);
        }
      }}
      className={segmentedListClassName({ fullWidth, className })}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={String(option.value)}
          value={String(option.value)}
          disabled={option.disabled}
          className={segmentedItemClassName({
            size,
            variant,
            fullWidth,
            className: itemClassName,
          })}
        >
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

export const SegmentedControl = forwardRef(SegmentedControlImpl) as <
  T extends SegmentedValue,
>(
  props: SegmentedControlProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
