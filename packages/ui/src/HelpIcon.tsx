import { QuestionIcon } from '@phosphor-icons/react';
import type { Icon, IconWeight } from '@phosphor-icons/react';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from './cn';
import { Tooltip, TooltipProps } from './Tooltip';
import { useNoHover } from './useMediaQuery';

const TONE_CLASS = {
  muted: 'text-[var(--surface-text-muted)]',
  warning: 'text-[var(--pill-warning-dot)]',
} as const;

export interface HelpIconProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  /** Tooltip content, shown on hover and on keyboard focus. */
  label: ReactNode;
  /** Phosphor icon to draw. Defaults to a question mark. */
  icon?: Icon;
  size?: number;
  weight?: IconWeight;
  /** Colour of the icon: muted by default, or the warning colour. */
  tone?: 'muted' | 'warning';
  /** Accessible name of the button. Defaults to a translated "Help"; override for other meanings. */
  'aria-label'?: string;
  side?: TooltipProps['side'];
  tooltipProps?: Partial<Omit<TooltipProps, 'label' | 'children'>>;
}

/**
 * An icon that carries a tooltip, as a real focusable button.
 *
 * A phosphor icon is a bare `<svg>`: it cannot take keyboard focus and has no
 * name, so a `Tooltip` wrapped directly around one is reachable by hover only
 * and says nothing to a screen reader. Use this instead; the lint rule
 * `waldur-custom/no-tooltip-on-bare-icon` reports the bare form.
 *
 * On a touch screen (no hover) the tooltip opens on tap instead, and closes
 * on a tap outside or Escape.
 *
 * Place it beside a check control's `<label>`, not inside it: a click on it
 * would toggle the control, and a button inside a label is a second control
 * the label names.
 */
export const HelpIcon = forwardRef<HTMLButtonElement, HelpIconProps>(
  (
    {
      label,
      icon: IconComponent = QuestionIcon,
      size = 16,
      weight = 'bold',
      tone = 'muted',
      side,
      tooltipProps,
      className,
      'aria-label': ariaLabel = translate('Help'),
      ...rest
    },
    ref,
  ) => {
    // Hover where the pointer can hover; tap-to-open on touch screens.
    const trigger = useNoHover() ? 'click' : 'hover';
    return (
      <Tooltip label={label} side={side} trigger={trigger} {...tooltipProps}>
        <button
          ref={ref}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'm-0 inline-flex shrink-0 cursor-help border-0 bg-transparent p-0 align-middle leading-none',
            TONE_CLASS[tone],
            className,
          )}
          {...rest}
        >
          <IconComponent weight={weight} size={size} aria-hidden="true" />
        </button>
      </Tooltip>
    );
  },
);
HelpIcon.displayName = 'HelpIcon';
