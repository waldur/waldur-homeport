import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ComponentProps,
  createContext,
  CSSProperties,
  FC,
  forwardRef,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { FeaturedIcon, FeaturedIconVariant } from '../FeaturedIcon';

import { RadialBackground } from './RadialBackground';
import { useFocusThroughRemovals } from './useFocusThroughRemovals';
import { useInsidePointerDown } from './useInsidePointerDown';

/**
 * waldur-homeport's modal, without Bootstrap: the geometry of Bootstrap 5's
 * .modal as Metronic and the app restyled it (the $modal-* variables,
 * custom/_modal.scss and src/modal/ModalRoot.css this replaced), value for
 * value, on a Radix Dialog. The app's src/modal/ModalShell.tsx and
 * ModalDialog.tsx re-export this.
 *
 * Unlike shadcn's Dialog recipe (a single box), this keeps
 * Bootstrap's "scrollable overlay" shape: the overlay is the fixed,
 * scrolling layer and the content is the dialog box inside it, so a tall
 * dialog that is not `scrollable` scrolls the page-sized overlay, as
 * before.
 *
 * Every length is in px. Bootstrap's are rem against Metronic's 13px root
 * (1.85rem padding = 24px), and a micro-app has a 16px root, so rem would
 * make the two apps' dialogs different sizes.
 *
 * The header, body and footer carry `data-slot="modal-header"` (and so on)
 * for stylesheets and tests that need to reach into a dialog, in place of
 * Bootstrap's .modal-header/.modal-body/.modal-footer class names.
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Closes the enclosing modal: what a header's close button calls, and what
 * a dialog's own content (a search box's Escape) can call. Provided by
 * ModalShell, and by the app's src/modal/ModalShell.tsx.
 */
export const ModalHideContext = createContext<(() => void) | null>(null);

export const useModalHide = () => useContext(ModalHideContext);

/**
 * Tells ModalTitle it sits in a ModalShell, and whether the shell already
 * names the dialog (a string `title`); if not, the visible title names it
 * (Dialog.Title).
 */
export const ModalShellContext = createContext<{ named: boolean } | null>(null);

// Bootstrap's .modal-dialog margin: .5rem, and 1.75rem from sm up, at the
// 13px root. A centred or scrollable box fills the viewport less these.
const SIZE_CLASSNAMES: Record<ModalSize, string> = {
  sm: 'sm:max-w-[400px]',
  md: 'max-w-[544px]',
  lg: 'lg:max-w-[840px]',
  xl: 'lg:max-w-[840px] xl:max-w-[1140px]',
};

export interface ModalShellProps {
  open: boolean;
  onHide: () => void;
  /** The dialog's accessible name, when it is not its visible title. */
  title?: ReactNode;
  size?: ModalSize;
  centered?: boolean;
  /** Keep the header and footer in view and scroll the body. */
  scrollable?: boolean;
  /** The scrolling overlay. */
  className?: string;
  /** The dialog's outer box, which sizes and places it. */
  dialogClassName?: string;
  /** The visible box: background, radius, shadow. */
  contentClassName?: string;
  backdropClassName?: string;
  modalStyle?: CSSProperties;
  /** Escape closes the dialog. */
  keyboard?: boolean;
  /** `'static'`: a click outside does not close it. `false`: no backdrop. */
  backdrop?: boolean | 'static';
  animation?: boolean;
  /** `'confirm'` stacks it over another open modal. */
  layer?: 'modal' | 'confirm';
  onCloseAutoFocus?: (event: Event) => void;
  children?: ReactNode;
}

/**
 * A modal Radix Dialog in the app's modal geometry.
 *
 * Radix does the modal work: it traps focus (Tab wraps), hides the rest of
 * the page from assistive technology, locks its scroll, closes on Escape or
 * a click outside the box, and stacks dialogs (a `layer="confirm"` one over
 * another). Selects, menus, popovers and date pickers rendered inside count
 * as inside wherever they are portaled, as Radix follows the React tree;
 * useFocusThroughRemovals keeps the trap from swallowing a Tab out of a
 * select. Content portaled in from another React tree opts in with
 * `data-dialog-inside` (useInsidePointerDown).
 */
export const ModalShell: FC<ModalShellProps> = ({
  open,
  onHide,
  title,
  size,
  centered = true,
  scrollable = true,
  className,
  dialogClassName,
  contentClassName,
  backdropClassName,
  modalStyle,
  keyboard = true,
  backdrop = true,
  animation = true,
  layer = 'modal',
  onCloseAutoFocus,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInsidePointerDown = useInsidePointerDown(contentRef);
  useFocusThroughRemovals(contentRef, open);
  const named = typeof title === 'string' && title !== '';
  const confirm = layer === 'confirm';

  // Bootstrap's .fade: the backdrop and the overlay fade over .15s linear,
  // while the box inside the overlay slides (Modal's keyframes in
  // waldur-design-tokens/animations.css). `forwards` holds the faded-out
  // frame until Radix's Presence unmounts the node.
  const fade = animation
    ? 'animate-[waldur-backdrop-enter_.15s_linear] data-[state=closed]:animate-[waldur-backdrop-exit_.15s_linear_forwards]'
    : 'animate-none data-[state=closed]:animate-none';

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onHide();
      }}
    >
      <DialogPrimitive.Portal>
        {backdrop !== false && (
          <div
            data-slot="modal-backdrop"
            data-state={open ? 'open' : 'closed'}
            data-waldur-animated=""
            className={cn(
              'fixed top-0 left-0 h-screen w-screen bg-[var(--modal-backdrop-bg)] backdrop-blur-[var(--modal-backdrop-blur)]',
              confirm ? 'z-confirm-backdrop' : 'z-modal-backdrop',
              fade,
              backdropClassName,
            )}
          />
        )}
        <DialogPrimitive.Overlay
          data-slot="modal"
          data-waldur-animated=""
          className={cn(
            'fixed top-0 left-0 h-full w-full overflow-x-hidden overflow-y-auto outline-none',
            confirm ? 'z-confirm' : 'z-modal',
            fade,
            className,
          )}
          style={modalStyle}
        >
          <DialogPrimitive.Content
            ref={contentRef}
            data-slot="modal-dialog"
            data-scrollable={scrollable ? '' : undefined}
            data-waldur-animated=""
            className={cn(
              'group/modal relative m-[6.5px] w-auto outline-none sm:mx-auto sm:my-[22.75px] sm:max-w-[544px]',
              centered &&
                'flex min-h-[calc(100%-13px)] items-center sm:min-h-[calc(100%-45.5px)]',
              scrollable && 'h-[calc(100%-13px)] sm:h-[calc(100%-45.5px)]',
              size && SIZE_CLASSNAMES[size],
              animation
                ? 'animate-[waldur-modal-slide-in_.3s_ease-out] data-[state=closed]:animate-[waldur-modal-slide-out_.15s_ease-in_forwards]'
                : 'animate-none data-[state=closed]:animate-none',
              dialogClassName,
            )}
            aria-describedby={undefined}
            // As Bootstrap's: only the visible box takes the pointer, so a
            // click in the rest of the outer box (the full height, when
            // centred) reaches the overlay and closes the dialog. Radix sets
            // pointer-events inline, so a class could not override it.
            style={{ pointerEvents: 'none' }}
            onPointerDownOutside={(event) => {
              if (backdrop === 'static' || isInsidePointerDown(event)) {
                event.preventDefault();
              }
            }}
            onEscapeKeyDown={(event) => {
              // An open select takes Escape to close its own menu.
              const target = event.target as Element | null;
              if (
                keyboard === false ||
                target?.getAttribute?.('aria-expanded') === 'true'
              ) {
                event.preventDefault();
              }
            }}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            {named && (
              <DialogPrimitive.Title className="sr-only">
                {title}
              </DialogPrimitive.Title>
            )}
            <div
              data-slot="modal-content"
              // Inline, as the box's pointer-events: none above is: the pair
              // is behaviour, not styling, and must hold without the
              // stylesheet (tests run without one).
              style={{ pointerEvents: 'auto' }}
              className={cn(
                'relative flex w-full flex-col rounded-xl bg-primary bg-clip-padding shadow-[var(--modal-shadow-xs)] outline-none sm:shadow-[var(--modal-shadow)]',
                // In a scrollable dialog only the body scrolls, so the
                // wrappers dialogs put between this box and their header,
                // body and footer (a <form>, ModalDialog's own <div>) become
                // shrinking flex columns too (the modal-passthrough variant).
                scrollable &&
                  'max-h-full overflow-hidden modal-passthrough:flex modal-passthrough:flex-col modal-passthrough:overflow-hidden',
                contentClassName,
              )}
            >
              <ModalShellContext.Provider value={{ named }}>
                <ModalHideContext.Provider value={onHide}>
                  {children}
                </ModalHideContext.Provider>
              </ModalShellContext.Provider>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

/**
 * Bootstrap's .btn-close in a modal header: its X glyph at 1em (13px), in
 * gray-400 (gray-dark-500 in dark mode) at half opacity, padded out to a
 * 37px target that bleeds into the header's padding, and lifted to the
 * header's top edge, as the app's Bootstrap modal had it.
 */
export const ModalCloseButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'>
>(({ className, onClick, ...props }, ref) => {
  const hide = useModalHide();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={translate('Close')}
      data-slot="modal-close"
      className={cn(
        'mt-[-6.5px] mr-[-12px] mb-[-12px] ml-auto box-content size-[13px] shrink-0 self-start rounded-lg border-0 bg-transparent p-[12px] text-[var(--color-gray-400)] opacity-50 hover:opacity-75 focus-visible:opacity-100 focus-visible:shadow-[0_0_0_0.25rem_color-mix(in_srgb,var(--focus-ring-color)_25%,transparent)] focus-visible:outline-none dark:text-[var(--color-gray-dark-500)]',
        className,
      )}
      onClick={onClick ?? (hide ? () => hide() : undefined)}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="block size-full"
      >
        <path d="M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z" />
      </svg>
    </button>
  );
});
ModalCloseButton.displayName = 'ModalCloseButton';

export interface ModalHeaderProps extends ComponentProps<'div'> {
  /** Render the close button; it closes the enclosing modal. */
  closeButton?: boolean;
  /** Overrides what the close button calls. */
  onHide?: () => void;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ closeButton = false, onHide, className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="modal-header"
      className={cn(
        'flex shrink-0 items-center justify-between rounded-t-xl px-[24px] pt-[24px] pb-[8px]',
        className,
      )}
      {...props}
    >
      {children}
      {closeButton && <ModalCloseButton onClick={onHide} />}
    </div>
  ),
);
ModalHeader.displayName = 'ModalHeader';

/**
 * The visible title: an h3 (or `as`) at the app's 18px/28px, medium weight. In a
 * ModalShell that has no name of its own (a string `title`), it names the
 * dialog, as Radix's Dialog.Title.
 */
export interface ModalTitleProps extends ComponentProps<'h3'> {
  /** The heading level; the look stays the same. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ as: Heading = 'h3', className, children, ...props }, ref) => {
    const shell = useContext(ModalShellContext);
    const title = (
      <Heading
        ref={ref}
        data-slot="modal-title"
        className={cn('m-0 text-lg font-medium text-primary', className)}
        {...props}
      >
        {children}
      </Heading>
    );
    return shell && !shell.named && children ? (
      <DialogPrimitive.Title asChild>{title}</DialogPrimitive.Title>
    ) : (
      title
    );
  },
);
ModalTitle.displayName = 'ModalTitle';

export const ModalSubtitle = forwardRef<
  HTMLHeadingElement,
  ComponentProps<'h6'>
>(({ className, children, ...props }, ref) => (
  <h6
    ref={ref}
    data-slot="modal-subtitle"
    className={cn(
      'mt-[8px] mb-0 text-sm font-normal text-quaternary',
      className,
    )}
    {...props}
  >
    {children}
  </h6>
));
ModalSubtitle.displayName = 'ModalSubtitle';

/**
 * 24px all round. Its last child (or its only wrapper's last child) loses
 * its bottom margin, so a form's last field doesn't pad the end of the
 * dialog twice.
 */
export const ModalBody = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="modal-body"
      className={cn(
        'relative flex-[1_1_auto] p-[24px] group-data-[scrollable]/modal:overflow-y-auto [&>:last-child]:mb-0! [&>div>:last-child]:mb-0!',
        className,
      )}
      {...props}
    />
  ),
);
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="modal-footer"
      className={cn(
        'flex shrink-0 flex-wrap items-center justify-end gap-[12px] rounded-b-xl px-[24px] pt-[8px] pb-[24px]',
        className,
      )}
      {...props}
    />
  ),
);
ModalFooter.displayName = 'ModalFooter';

export interface ModalDialogProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  iconNode?: ReactNode;
  iconColor?: FeaturedIconVariant;
  footer?: ReactNode;
  closeButton?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  headerLess?: boolean;
  /** Placed at the end of the header, before the close button. */
  actions?: ReactNode;
  /** Placed between the header and the body. */
  extra?: ReactNode;
  extraClassName?: string;
  onHide?(): void;
}

/**
 * The usual dialog layout: a header (an optional featured icon over the
 * radial rings, the title, a subtitle, actions and the close button), the
 * body and an optional footer. Props match src/modal/ModalDialog.tsx.
 */
export const ModalDialog: FC<ModalDialogProps> = ({
  closeButton = true,
  title,
  subtitle,
  iconNode,
  iconColor,
  children,
  footer,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  headerLess,
  actions,
  extra,
  extraClassName,
  onHide,
}) => (
  <div className={className}>
    {!headerLess && (
      <ModalHeader
        closeButton={closeButton}
        onHide={onHide}
        className={cn(iconNode && 'relative overflow-hidden', headerClassName)}
      >
        <div className="grow">
          {Boolean(iconNode) && (
            <>
              <RadialBackground className="absolute top-[-18px] left-[49px] h-[270px] -translate-x-1/2" />
              <FeaturedIcon
                icon={iconNode}
                variant={iconColor}
                tone="solid"
                size="lg"
                className="relative mb-[20px]"
              />
            </>
          )}
          <ModalTitle>{title}</ModalTitle>
          {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
        </div>
        {actions}
      </ModalHeader>
    )}
    {Boolean(extra) && (
      <ModalHeader className={extraClassName}>{extra}</ModalHeader>
    )}
    {/* Bootstrap's `.modal-header ~ .modal-body`: 12px under a header
        rather than 24px. Set here, not with a sibling selector, so a
        caller's bodyClassName still overrides it. */}
    <ModalBody
      className={cn(
        (!headerLess || Boolean(extra)) && 'pt-[12px]',
        bodyClassName,
      )}
    >
      {children}
    </ModalBody>
    {footer && (
      <ModalFooter className={footerClassName} data-testid="modal-footer">
        {footer}
      </ModalFooter>
    )}
  </div>
);
