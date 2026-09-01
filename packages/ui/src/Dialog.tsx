import { XIcon } from '@phosphor-icons/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ComponentProps, ElementRef, forwardRef } from 'react';

import { cn } from './cn';

/**
 * shadcn's actual Dialog recipe (see
 * https://ui.shadcn.com/docs/components/dialog) — the centered-modal
 * sibling of Sheet.tsx, which ports the same Radix Dialog primitive as a
 * slide-in panel. Everything Sheet.tsx's own comment explains applies
 * verbatim here: surfaceColors.css tokens instead of shadcn's palette,
 * plain data-state-keyed transitions rather than the tailwindcss-animate
 * utilities (that plugin isn't installed), and forwardRef on every
 * primitive Radix attaches a ref to.
 *
 * Kept as its own file rather than another `side` variant of Sheet: a
 * centered modal isn't an edge-anchored panel, and the two have different
 * sizing, radius and shadow treatments.
 *
 * The backdrop and the enter/exit motion are waldur-homeport's own real
 * Bootstrap modal, value for value: a gray-900/70% scrim with
 * `backdrop-filter: blur(3px)` (--modal-backdrop-bg/--modal-backdrop-blur,
 * see surfaceColors.css), the dialog sliding down from -50px over .3s
 * ease-out, and both fading over .15s linear. That motion is keyframes
 * from waldur-design-tokens/animations.css rather than the
 * data-state-keyed transitions Sheet.tsx uses — see that file's comment
 * for why a transition can't work under Radix's Presence at all.
 * Consequently a consumer that doesn't import animations.css gets a
 * correct, instantly-appearing dialog rather than a broken one.
 *
 * Centering is `inset-0 m-auto h-fit` — auto margins inside a fixed
 * full-viewport box — rather than the usual top/left-50% plus a -50%
 * translate, so that `transform` belongs entirely to the animation and
 * the enter keyframe's own translate can't fight it.
 *
 * The obvious alternative — keep translate-centering, move the animation
 * to a wrapper around Content — does not work: DialogPortal wraps *each*
 * of its children in its own Presence (React.Children.map over Presence,
 * in the Radix source), and Presence decides when a closing node may
 * unmount by reading that node's computed animationName. An unanimated
 * wrapper resolves instantly and takes its Content down mid-exit. The
 * animation has to sit on Content itself, with nothing in between.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-waldur-animated=""
    className={cn(
      // backdrop-blur-* compiles to -webkit-backdrop-filter *and* the
      // unprefixed property, so Safari before 18 is covered the same way
      // the main app's own rule covers it by hand ("Fix blur for
      // Safari", src/metronic/sass/custom/_modal.scss) — verified in the
      // generated CSS, not assumed.
      'fixed inset-0 z-50 bg-[var(--modal-backdrop-bg)] backdrop-blur-[var(--modal-backdrop-blur)]',
      'animate-[waldur-backdrop-enter_.15s_linear] data-[state=closed]:animate-[waldur-backdrop-exit_.15s_linear]',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps extends ComponentProps<
  typeof DialogPrimitive.Content
> {
  /** Set false for a dialog whose own content owns dismissal. */
  showCloseButton?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-waldur-animated=""
      className={cn(
        'fixed inset-0 z-50 m-auto flex h-fit w-[calc(100%-2rem)] max-w-lg flex-col gap-6',
        'max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[20px] bg-[var(--surface-card-bg)] p-6 text-[var(--surface-text-primary)] shadow-[var(--dropdown-shadow)]',
        'animate-[waldur-modal-enter_.3s_ease-out] data-[state=closed]:animate-[waldur-modal-exit_.3s_ease-out]',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-[var(--nav-item-active-bg)] focus:outline-hidden">
          <XIcon size={16} weight="bold" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentProps<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-2xl font-semibold text-[var(--surface-text-primary)]',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentProps<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[var(--surface-text-secondary)]', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
