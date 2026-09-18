import { XIcon } from '@phosphor-icons/react';
import * as RadixToast from '@radix-ui/react-toast';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { AlertItem, AlertItemVariant } from './AlertItem';
import { BaseButton } from './BaseButton';
import { cn } from './cn';
import { Tooltip } from './Tooltip';

export const ToastProvider = RadixToast.Provider;

/**
 * Renders once, wherever the app mounts its toast stack. `z-50` is this
 * package's own generic default (same call as Dialog/Popover/DropdownMenu,
 * see tailwind.css's own comment on why those keep Tailwind's built-in
 * scale rather than a named token) — override via `className`/`style` if a
 * consuming app has its own legacy z-index stack to sit above or below, the
 * way waldur-homeport's NotificationContainer does.
 */
export const ToastViewport = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport
    ref={ref}
    className={cn(
      // list-none: this is a real <ol> (Viewport) of <li>s (each Root), not
      // a styling choice — Bootstrap's own list reset in the consuming
      // app's tailwind.css restores bullets/numbers on bare ol/ul deliberately
      // (see that file's own comment), which reaches this one too since it
      // isn't marked up as a menu/nav.
      'fixed top-6 right-6 z-50 flex w-[400px] max-w-[calc(100vw-3rem)] list-none flex-col gap-3 outline-none',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  /** Renders in the brand colour; use for the affirmative action. */
  primary?: boolean;
}

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  message?: ReactNode;
  variant: AlertItemVariant;
  actions?: ToastAction[];
  /** Ignored (treated as never-expiring) below zero and at Infinity — see ToastProvider. */
  duration?: number;
}

/**
 * A toast: AlertItem in its floating form, so toasts and page alerts stay
 * one component, mounted through Radix's Toast.Root for its accessibility
 * (announcement, focus, Escape) and swipe-to-dismiss behaviour. `open` is
 * meant to be owned by a small external store, not local component state —
 * see waldur-homeport's src/store/notify.tsx for the reference caller: it
 * needs a callable-from-anywhere `NotifyService.success(...)` API, which
 * only a store outside React can provide.
 */
export const Toast = ({
  open,
  onOpenChange,
  title,
  message,
  variant,
  actions,
  duration,
}: ToastProps) => {
  const hasActions = Boolean(actions?.length);
  const close = () => onOpenChange(false);

  return (
    <RadixToast.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      data-waldur-animated=""
      className={cn(
        // toast-item/toast-item-{variant}: not a styling hook (every visual
        // rule below is a Tailwind utility) — a stable CSS marker the
        // waldur-integration-testing E2E suite locates toasts by
        // (tests/components/base.py's _notifications(), which already
        // matches both this and the older reapop markup for exactly this
        // migration). Dropping it here breaks that suite silently, since it
        // lives in a separate repo this package can't type-check against.
        'toast-item',
        `toast-item-${variant}`,
        'data-[state=open]:animate-[waldur-toast-enter_.2s_ease-out]',
        'data-[state=closed]:animate-[waldur-toast-exit_.15s_ease-in]',
        // Live-follows the drag. A completed swipe (data-swipe=end) stops
        // matching this rule and briefly snaps back to translateX(0) before
        // data-state=closed's exit keyframe re-animates it off-screen —
        // giving a completed swipe its own from-swipe-position animation
        // needs the exit rule to know which case it's in, which plain CSS
        // attribute selectors can't express (no != operator); acceptable
        // given how fast both animations are.
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200',
      )}
    >
      <AlertItem
        className="items-start gap-4 rounded-[12px] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)]"
        iconSize="md"
        iconClassName="-m-[9px]"
        type="floating"
        variant={variant}
        title={
          <RadixToast.Title asChild>
            <span>{title}</span>
          </RadixToast.Title>
        }
        body={
          message || hasActions ? (
            <RadixToast.Description asChild>
              <div>
                {message}
                {hasActions && (
                  <div className="mt-[10px] flex items-center gap-3">
                    {actions.map((action) => (
                      <RadixToast.Action
                        key={action.label}
                        altText={action.label}
                        onClick={() => {
                          action.onClick?.();
                          close();
                        }}
                        asChild
                      >
                        <BaseButton
                          size="sm"
                          variant={
                            action.primary ? 'text-primary' : 'text-secondary'
                          }
                          label={action.label}
                        />
                      </RadixToast.Action>
                    ))}
                  </div>
                )}
              </div>
            </RadixToast.Description>
          ) : undefined
        }
        actions={
          // The mock dismisses with a 20px glyph, not a full-size icon
          // button — smaller than BaseButton's own icon-only 'sm' (28px),
          // so this stays a plain button rather than going through it.
          <RadixToast.Close asChild>
            <Tooltip label={translate('Dismiss')}>
              <button
                type="button"
                aria-label={translate('Dismiss')}
                className="inline-flex size-5 items-center justify-center text-[var(--surface-text-muted)]"
              >
                <XIcon size={20} weight="regular" />
              </button>
            </Tooltip>
          </RadixToast.Close>
        }
      />
    </RadixToast.Root>
  );
};
