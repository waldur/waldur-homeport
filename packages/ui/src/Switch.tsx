import { ComponentProps } from 'react';

import { cn } from './cn';

export interface SwitchProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'onChange' | 'checked'
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * AwesomeCheckbox's real recipe (src/core/AwesomeCheckbox.tsx, `type=
 * "switch"` — its default) is a native `<input type="checkbox">` styled
 * via Bootstrap's .form-switch class, not a from-scratch widget — same
 * approach here (a visually-hidden real checkbox plus a styled sibling
 * span), just with Tailwind classes instead of that SCSS. The checked
 * track color is real — src/metronic/sass/core/components/_variables.scss's
 * `$form-switch-checked-bg-color: $component-active-bg`, which resolves to
 * the same var(--waldur-brand-color) the checked radio/other "active"
 * controls in that same stylesheet use. Track/knob dimensions aren't SCSS-
 * traced the same way — Bootstrap's own $form-switch-width default (2em)
 * has no explicit height override in this repo's SCSS, and there's no
 * live instance in this app to measure the rendered px from — so those
 * are a standard toggle-switch size instead.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  return (
    <label
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--waldur-brand-color)] has-[:focus-visible]:ring-offset-2',
        checked
          ? 'bg-[var(--waldur-brand-color)]'
          : 'bg-[var(--surface-hover-bg)]',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="sr-only"
        {...props}
      />
      <span
        className={cn(
          'inline-block size-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </label>
  );
}
