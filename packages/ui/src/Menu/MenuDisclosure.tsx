import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  MutableRefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../cn';
import { useBreakpointDown } from '../useMediaQuery';

import { compose, HoverContext, useHoverOpen } from './hoverContext';
import { menuSurface } from './MenuContent';
import {
  MenuCloseContext,
  MenuLookProvider,
  MenuRowOptions,
} from './menuContext';
import { menuRowDataAttributes, useMenuItemClassName } from './MenuItem';
import { MenuSeparator } from './MenuSeparator';

/**
 * A list of navigation links (the user menu, the footer menus) behind a
 * button, as the APG disclosure pattern rather than an application menu
 * (`role="menu"`): the rows are plain links and buttons in the Tab order,
 * not menu items reached with the arrow keys.
 *
 * - The panel is not portaled: it follows its trigger in the DOM, so Tab
 *   from the trigger enters it and Tab from its last row leaves it for the
 *   next element on the page, which closes it. Escape or a click outside
 *   closes it too, and Escape returns focus to the trigger.
 * - Opening it leaves focus on the trigger, as a disclosure does.
 * - Menu.Item, Menu.CopyItem, Menu.Separator and NavMenuLink rows render
 *   as plain buttons and links in it (see MenuKind). A nested list of
 *   links is a MenuDisclosure.Section, a flyout beside its row.
 * - `openOnHover` opens it on pointer hover, as Menu's does; a click still
 *   opens and closes it, and the keyboard opens it with Enter or Space.
 */

interface DisclosureState {
  open: boolean;
  hoverEnabled: boolean;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
}

const DisclosureContext = createContext<DisclosureState>({
  open: false,
  hoverEnabled: false,
  triggerRef: { current: null },
});

interface DrillState {
  /** Where a drilled-into section renders its rows. */
  slot: HTMLElement | null;
  /** The section drilled into, which replaces the panel's rows. */
  drilled: string | null;
  setDrilled(id: string | null): void;
}

const DrillContext = createContext<DrillState | null>(null);

export type MenuDisclosureProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>,
  'modal'
> & {
  /** Open on pointer hover; `"desktop"`: only at `lg` and up. */
  openOnHover?: boolean | 'desktop';
};

const MenuDisclosureRoot = ({
  openOnHover,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: MenuDisclosureProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const hover = useHoverOpen(openOnHover || 'desktop', open, setOpen);
  const hoverEnabled = Boolean(openOnHover) && hover.enabled;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <DisclosureContext.Provider value={{ open, hoverEnabled, triggerRef }}>
      <HoverContext.Provider value={openOnHover ? hover : null}>
        <MenuCloseContext.Provider value={() => setOpen(false)}>
          <PopoverPrimitive.Root
            {...props}
            modal={false}
            open={open}
            onOpenChange={setOpen}
          />
        </MenuCloseContext.Provider>
      </HoverContext.Provider>
    </DisclosureContext.Provider>
  );
};

/**
 * The button that shows and hides the panel. It announces only whether
 * the panel is expanded: a disclosure opens no popup.
 */
const MenuDisclosureTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ onMouseEnter, onMouseLeave, onPointerDown, onClick, ...props }, ref) => {
  const hover = useContext(HoverContext)?.trigger;
  const { open, hoverEnabled, triggerRef } = useContext(DisclosureContext);
  // Hover has already opened the panel by the time a mouse clicks the
  // trigger, and the click would toggle it shut again.
  const openedByHover = useRef(false);
  return (
    <PopoverPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      aria-haspopup={undefined}
      onMouseEnter={compose<MouseEvent<HTMLButtonElement>>(
        onMouseEnter,
        hover?.onMouseEnter,
      )}
      onMouseLeave={compose<MouseEvent<HTMLButtonElement>>(
        onMouseLeave,
        hover?.onMouseLeave,
      )}
      onPointerDown={compose<PointerEvent<HTMLButtonElement>>(
        onPointerDown,
        (event) => {
          openedByHover.current =
            hoverEnabled && open && event.pointerType === 'mouse';
        },
      )}
      onClick={compose<MouseEvent<HTMLButtonElement>>(onClick, (event) => {
        if (openedByHover.current) event.preventDefault();
        openedByHover.current = false;
      })}
      {...props}
    />
  );
});
MenuDisclosureTrigger.displayName = 'MenuDisclosure.Trigger';

// Radix's focus scope wraps Tab from the last row round to the first, even
// in a non-modal popover. A disclosure lets Tab move on through the page,
// so Tab stops here, before it reaches the scope; the browser still moves
// focus, and focus leaving the panel closes it.
const keepTabInPageOrder = (event: KeyboardEvent) => {
  if (event.key === 'Tab') event.stopPropagation();
};

type MenuDisclosureContentProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  'asChild'
> &
  MenuRowOptions;

const MenuDisclosureContent = forwardRef<
  HTMLDivElement,
  MenuDisclosureContentProps
>(
  (
    {
      density,
      tone,
      className,
      sideOffset = 2,
      children,
      onOpenAutoFocus,
      onMouseEnter,
      onMouseLeave,
      onInteractOutside,
      onEscapeKeyDown,
      ...props
    },
    ref,
  ) => {
    const hover = useContext(HoverContext)?.content;
    const { triggerRef } = useContext(DisclosureContext);
    const close = useContext(MenuCloseContext);
    const [slot, setSlot] = useState<HTMLElement | null>(null);
    const [drilledId, setDrilled] = useState<string | null>(null);
    // A drill-down is phone-only: widened past it, the sections are flyouts.
    const drilled = useBreakpointDown('md') ? drilledId : null;
    return (
      <MenuLookProvider look="nav" kind="disclosure">
        <PopoverPrimitive.Content
          ref={ref}
          // A list of links, not a dialog.
          role={undefined}
          sideOffset={sideOffset}
          {...menuRowDataAttributes({ density, tone })}
          className={cn(
            'group/menu',
            menuSurface({ look: 'nav', container: 'disclosure' }),
            className,
          )}
          onOpenAutoFocus={compose(onOpenAutoFocus, (event) =>
            event.preventDefault(),
          )}
          onMouseEnter={compose<MouseEvent<HTMLDivElement>>(
            onMouseEnter,
            hover?.onMouseEnter,
          )}
          onMouseLeave={compose<MouseEvent<HTMLDivElement>>(
            onMouseLeave,
            hover?.onMouseLeave,
          )}
          // The trigger is not outside: Radix keeps the panel open when
          // Shift+Tab returns to it, but still counts it as leaving, and
          // then Escape would drop focus on the page instead of the trigger.
          // Radix's focus guards at the ends of <body> are not outside
          // either: Tab past the panel reaches one only when nothing on the
          // page follows it (the footer menus), and closing would remove the
          // guard and drop focus on <body>. Close it from here instead, which
          // returns focus to the trigger.
          onInteractOutside={compose(onInteractOutside, (event) => {
            const target = event.target as Element;
            if (triggerRef.current?.contains(target)) {
              event.preventDefault();
            } else if (target.hasAttribute?.('data-radix-focus-guard')) {
              event.preventDefault();
              close?.();
            }
          })}
          // Drilled into a section, Escape goes back up a level, as the
          // flyout's Escape closes only the flyout.
          onEscapeKeyDown={compose(onEscapeKeyDown, (event) => {
            if (drilled) {
              event.preventDefault();
              setDrilled(null);
            }
          })}
          {...props}
        >
          <div
            role="presentation"
            className="contents"
            onKeyDown={keepTabInPageOrder}
          >
            <div ref={setSlot} className="contents" />
            <div
              hidden={drilled !== null}
              className={drilled ? undefined : 'contents'}
            >
              <DrillContext.Provider value={{ slot, drilled, setDrilled }}>
                {children}
              </DrillContext.Provider>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </MenuLookProvider>
    );
  },
);
MenuDisclosureContent.displayName = 'MenuDisclosure.Content';

/**
 * A nested list of rows (the profile's Credentials pages, the languages)
 * in a flyout beside its own row, like a submenu. The flyout is not
 * portaled either: it follows its row in the DOM, so Tab from the row
 * enters it and Tab from its last row moves on to the next row, which
 * closes it. Hover opens it on desktop; a click, Enter or Space opens it
 * anywhere, and Escape closes only the flyout.
 *
 * On a phone there is no room beside the panel, so the section drills
 * down instead: its rows replace the panel's, under a row that goes back,
 * as Escape does.
 */
const MenuDisclosureSection = ({
  label,
  title,
  backLabel,
  className,
  contentClassName,
  children,
}: {
  label: ReactNode;
  /** The phone's back row, which titles the drilled list; the label by
   * default. */
  title?: ReactNode;
  /** Read out before the title on the phone's back row ("Back"). */
  backLabel?: ReactNode;
  /** Goes on the row, so UISrefActive can mark it current. */
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const hover = useHoverOpen('desktop', open, setOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // Hover has already opened the flyout by the time a mouse clicks its
  // row, and the click would toggle it shut again.
  const openedByHover = useRef(false);
  const rowClassName = useMenuItemClassName();
  const drill = useContext(DrillContext);
  const isPhone = useBreakpointDown('md');
  const id = useId();
  const backRef = useRef<HTMLButtonElement | null>(null);
  const drilledIn = drill?.drilled === id;
  const wasDrilledIn = useRef(false);
  // Focus follows the drill: onto the back row going in, and back onto
  // this row coming out.
  useEffect(() => {
    if (drilledIn) backRef.current?.focus();
    else if (wasDrilledIn.current) triggerRef.current?.focus();
    wasDrilledIn.current = drilledIn;
  }, [drilledIn]);

  if (isPhone && drill) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={drilledIn}
          className={cn(rowClassName, 'w-full text-start', className)}
          onClick={() => drill.setDrilled(id)}
        >
          <span className="grow">{label}</span>
          <CaretRightIcon
            weight="bold"
            aria-hidden="true"
            className="ms-1.5 size-[14px] shrink-0 rtl:-scale-x-100"
          />
        </button>
        {drilledIn &&
          drill.slot &&
          createPortal(
            <>
              <button
                ref={backRef}
                type="button"
                className={cn(rowClassName, 'w-full text-start font-semibold')}
                onClick={() => drill.setDrilled(null)}
              >
                <CaretLeftIcon
                  weight="bold"
                  aria-hidden="true"
                  className="me-1.5 size-[14px] shrink-0 rtl:-scale-x-100"
                />
                {backLabel && <span className="sr-only">{backLabel}</span>}
                <span className="grow">{title ?? label}</span>
              </button>
              <MenuSeparator />
              {children}
            </>,
            drill.slot,
          )}
      </>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <PopoverPrimitive.Trigger
        ref={triggerRef}
        aria-haspopup={undefined}
        className={cn(rowClassName, 'w-full text-start', className)}
        onMouseEnter={hover.trigger.onMouseEnter}
        onMouseLeave={hover.trigger.onMouseLeave}
        onPointerDown={(event) => {
          openedByHover.current =
            hover.enabled && open && event.pointerType === 'mouse';
          hover.trigger.onPointerDown(event);
        }}
        onClick={(event) => {
          if (openedByHover.current) event.preventDefault();
          openedByHover.current = false;
        }}
      >
        <span className="grow">{label}</span>
        <CaretRightIcon
          weight="bold"
          aria-hidden="true"
          className="ms-1.5 size-[14px] shrink-0 rtl:-scale-x-100"
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        role={undefined}
        side="right"
        align="start"
        sideOffset={4}
        className={cn(
          'group/menu',
          menuSurface({ look: 'nav', container: 'disclosure' }),
          contentClassName,
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={hover.content.onMouseEnter}
        onMouseLeave={hover.content.onMouseLeave}
        onPointerDownOutside={hover.content.onPointerDownOutside}
        // Shift+Tab back to the row is not leaving the section.
        onInteractOutside={(event) => {
          if (triggerRef.current?.contains(event.target as Element)) {
            event.preventDefault();
          }
        }}
      >
        <div
          role="presentation"
          className="contents"
          onKeyDown={keepTabInPageOrder}
        >
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
};

export const MenuDisclosure = Object.assign(MenuDisclosureRoot, {
  Trigger: MenuDisclosureTrigger,
  Content: MenuDisclosureContent,
  Section: MenuDisclosureSection,
});
