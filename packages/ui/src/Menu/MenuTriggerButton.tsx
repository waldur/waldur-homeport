import { forwardRef, ReactNode } from 'react';

import { BaseButton, BaseButtonProps } from '../BaseButton';
import { ButtonCaret } from '../ButtonCaret';
import { cn } from '../cn';

import { MenuTrigger } from './MenuTrigger';

export interface MenuTriggerButtonProps extends BaseButtonProps {
  /**
   * Optional leading icon before the label.
   */
  icon?: ReactNode;
  /**
   * Whether to render the rotating dropdown caret indicator.
   * Defaults to `true`.
   */
  caret?: boolean;
}

/**
 * Dropdown button trigger for `Menu`.
 *
 * Wraps `BaseButton` in `Menu.Trigger asChild` with `className="group/toggle"`
 * and a trailing `ButtonCaret` by default so the caret flips 180° when open.
 */
export const MenuTriggerButton = forwardRef<
  HTMLButtonElement,
  MenuTriggerButtonProps
>(
  (
    {
      variant = 'tertiary',
      size = 'md',
      className,
      caret = true,
      icon,
      iconNode,
      iconRight,
      children,
      label = children,
      'data-testid': testId = 'actions-toggle',
      ...props
    },
    ref,
  ) => {
    // If iconNode is passed with default caret, treat iconNode as the leading icon
    const leadingIcon = icon ?? (caret && !iconRight ? iconNode : undefined);

    const effectiveLabel = leadingIcon ? (
      <span className="inline-flex items-center gap-2">
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center text-[var(--btn-icon-color,currentColor)]',
            size === 'sm' ? 'size-4 [&>svg]:size-4' : 'size-5 [&>svg]:size-5',
          )}
        >
          {leadingIcon}
        </span>
        {label}
      </span>
    ) : (
      label
    );

    const effectiveIconNode = caret ? <ButtonCaret size={size} /> : iconNode;
    const effectiveIconRight = caret ? (iconRight ?? true) : iconRight;

    return (
      <MenuTrigger asChild disabled={props.disabled}>
        <BaseButton
          ref={ref}
          variant={variant}
          size={size}
          className={cn('group/toggle', className)}
          label={effectiveLabel}
          iconNode={effectiveIconNode}
          iconRight={effectiveIconRight}
          data-testid={testId}
          {...props}
        />
      </MenuTrigger>
    );
  },
);
MenuTriggerButton.displayName = 'Menu.TriggerButton';
