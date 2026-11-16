import { PushPinIcon, PushPinSlashIcon, XIcon } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { FunctionComponent, useContext } from 'react';

import {
  BaseButton,
  useFocusThroughRemovals,
  useInsidePointerDown,
  useBreakpointUp,
} from 'waldur-ui';

import { DirtyFormContext } from '@/core/DirtyFormContext';
import { ErrorMessage } from '@/ErrorMessage';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { DrawerContext, drawerState } from './DrawerContext';
import { DOCK_MIN_PAGE_WIDTH } from './drawerDock';
import { DrawerResizeHandle } from './DrawerResizeHandle';
import { DRAWER_MIN_WIDTH, DRAWER_WIDE_WIDTH } from './drawerWidth';
import { DRAWER_SHELL_CLASS, DrawerShellClass } from './shellClasses';

export const DrawerRoot: FunctionComponent = () => {
  const context = useContext(DrawerContext);

  if (!context) {
    return null;
  }

  const {
    isOpen,
    drawerComponent,
    drawerProps,
    closeDrawer,
    expanded,
    width: draggedWidth,
    wide,
    setWide,
    historyOpen,
    panel,
    setPanel,
    docked: dockChosen,
    setDocked,
    setBesidePage,
  } = context;
  const [isDirtyContext, setIsDirtyContext] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // Content portaled in from another React tree (the docked Matrix call,
  // owned by MatrixCallHost so it survives moving between destinations)
  // would read as outside and dismiss the drawer on its first click.
  const isInsidePointerDown = useInsidePointerDown(contentRef);
  const panelRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      setPanel(node);
    },
    [setPanel],
  );
  // Expanded, the panel spans the page beside the sidebar, following it as
  // it collapses or expands (useSidebarLayoutShim).
  // Otherwise the width the user dragged it to, or the drawer's own.
  const resizable = Boolean(drawerProps.resizable);
  const isDesktop = useBreakpointUp('lg');
  // Whether the page keeps DOCK_MIN_PAGE_WIDTH beside the drawer: below it,
  // the page's layout -- chosen by the window's width -- would overflow.
  const [roomBeside, setRoomBeside] = React.useState(true);
  React.useEffect(() => {
    if (!isOpen || !isDesktop || !panel) return;
    // The page region left of the drawer, sidebar included: what the page
    // lays itself out by once the drawer docks.
    const measure = () =>
      setRoomBeside(
        document.documentElement.clientWidth -
          panel.getBoundingClientRect().width >=
          DOCK_MIN_PAGE_WIDTH,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isOpen, isDesktop, panel]);
  // The floating card drawers can dock (the toggle in their header). A
  // full-height drawer, a form say, cannot: it is modal, and a dialog
  // switching between modal and not remounts what it holds. Nor can the
  // assistant a signed-out visitor opens: the sign-in pages have no page
  // layout to dock beside.
  const user = useUser();
  const dockable =
    Boolean(drawerProps.shellClass) &&
    !(drawerProps.shellClass === DRAWER_SHELL_CLASS.ai && !user);
  // Docked, as the user chose: the page stays usable, and clicking it or
  // going to another page leaves the drawer open. Expanded, the drawer spans
  // the page and covers it as any drawer does.
  // Docked only from lg, where its toggle shows: below it the drawer fills
  // the screen, and a docked one could neither be undocked nor tapped away.
  const docked = dockable && dockChosen && isOpen && !expanded && isDesktop;
  // Beside the page: from lg, while the page keeps room beside the drawer,
  // the page narrows to make room for it; otherwise the drawer stays over the
  // page's right side until it is made narrower.
  const besidePage = docked && isDesktop && roomBeside;
  // Docked, it may have been dragged narrower than the drawer's own minimum
  // (so as to leave the page room); floating, it is never narrower than that.
  const ownMin: number = drawerProps.minWidth ?? DRAWER_MIN_WIDTH;
  const shownWidth =
    draggedWidth !== null && !docked
      ? Math.max(draggedWidth, ownMin)
      : draggedWidth;
  const width = expanded
    ? 'calc(100% - var(--layout-sidebar-width, 0px))'
    : shownWidth !== null
      ? `${shownWidth}px`
      : drawerProps.width;
  React.useLayoutEffect(() => {
    drawerState.docked = docked;
  }, [docked]);
  // The page narrows by the docked drawer's width (Layout), so that nothing
  // on it hides under the drawer.
  React.useEffect(() => {
    setBesidePage(besidePage);
  }, [besidePage, setBesidePage]);
  // A floating card is not modal -- a dialog switching between modal and not
  // remounts its contents, and it must not as it docks -- so nothing blocks
  // the page under it. A click outside it closes it and is swallowed, as a
  // modal's would be, rather than also acting on the page: Radix dismisses a
  // non-modal dialog only on the click, after the page has handled it.
  const floatingOverPage =
    isOpen && Boolean(drawerProps.shellClass) && !docked && !expanded;
  const onHideRef = React.useRef<() => void>(() => undefined);
  React.useEffect(() => {
    if (!floatingOverPage || !panel) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || panel.contains(target)) return;
      // The header's drawer toggles close or switch it themselves; menus,
      // popovers and dialogs it opened render outside it.
      if (
        target.closest(
          '[data-drawer-toggle], [data-radix-popper-content-wrapper], [role=dialog], [role=menu], [role=listbox]',
        )
      ) {
        return;
      }
      const swallow = (click: MouseEvent) => {
        click.preventDefault();
        click.stopPropagation();
        onHideRef.current();
      };
      document.addEventListener('click', swallow, {
        capture: true,
        once: true,
      });
      // A pointerdown with no click after it (a drag) must not eat a later
      // one.
      window.setTimeout(
        () => document.removeEventListener('click', swallow, { capture: true }),
        1000,
      );
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [floatingOverPage, panel]);
  React.useEffect(() => {
    if (!besidePage || !width) return;
    const root = document.documentElement.style;
    root.setProperty('--layout-docked-drawer-width', width);
    return () => {
      root.removeProperty('--layout-docked-drawer-width');
    };
  }, [besidePage, width]);
  // The contents switch to their expanded layout (history sidebar, script
  // panel, Team chat dock) by the panel's actual width, so a drawer dragged
  // wide gets it as well as an expanded one. Only where the user chooses the
  // width: below lg the panel is full width, and a fixed-width drawer is
  // laid out for the width it has.
  React.useEffect(() => {
    if (!panel || !resizable || !isDesktop) {
      setWide(false);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setWide(entry.contentRect.width >= DRAWER_WIDE_WIDTH);
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      setWide(false);
    };
  }, [panel, resizable, isDesktop, setWide]);
  // A Tab out of a select would land on the drawer itself (see the hook).
  useFocusThroughRemovals(contentRef, isOpen);
  const isDirtyForm = isDirtyContext;
  const onHide = () => {
    if (
      isDirtyForm &&
      !confirm(
        translate(
          'You have entered data in form. When drawer is closed form data would be lost.',
        ),
      )
    ) {
      return;
    }
    closeDrawer();
  };
  onHideRef.current = onHide;

  const shell = drawerProps.shellClass as DrawerShellClass | undefined;
  const floating = Boolean(shell);
  const chat =
    shell === DRAWER_SHELL_CLASS.ai || shell === DRAWER_SHELL_CLASS.support;

  return (
    <Dialog.Root
      open={isOpen}
      // A floating card is never modal, docked or not: switching would
      // remount its contents (a live chat, say) and replay its slide-in.
      // Floating, a click outside still closes it (onInteractOutside);
      // docked, it leaves the page live. A full-height drawer stays modal.
      modal={!floating}
      onOpenChange={(open) => {
        if (!open) onHide();
      }}
    >
      {isOpen && (
        <Dialog.Overlay
          data-slot="drawer-overlay"
          className={classNames(
            'fixed inset-0 overflow-hidden z-[109] bg-[var(--drawer-overlay-bg)] animate-[waldur-backdrop-enter_0.3s_ease-in-out]',
            // A floating card leaves the page around it visible. The overlay
            // still mounts, for the dialog's scroll lock.
            floating && 'hidden',
          )}
        />
      )}
      {/*
        No forceMount: Dialog.Content's own Presence (gated on the Root's
        `open`) keeps the panel mounted through the close animation on its
        own, as long as an actual @keyframes animation-name changes between
        the open and closed states (waldur-drawer-slide-in / -out) — Presence
        detects animations, not CSS transitions.
        forceMount was tried first and reverted: it keeps the Radix
        DismissableLayer's global pointerdown/focus listeners permanently
        registered even while closed, which broke real (trusted) clicks on
        the header's Support/Pending-tasks toggle buttons elsewhere on the
        page — untrusted/synthetic clicks and every other manual DOM check
        looked fine, which is why it wasn't caught until real click testing.
      */}
      <Dialog.Content
        ref={panelRef}
        data-slot="drawer"
        data-shell={shell}
        data-expanded={expanded || undefined}
        // Expanded counts even where the page beside the sidebar is
        // narrower than DRAWER_WIDE_WIDTH, as it did before resizing.
        data-wide={expanded || wide || undefined}
        data-history-open={historyOpen || undefined}
        className={classNames(
          'fixed right-0 flex bg-primary',
          'animate-[waldur-drawer-slide-in_0.3s_ease-in-out] data-[state=closed]:animate-[waldur-drawer-slide-out_0.3s_ease-in-out_forwards]',
          // Full width below lg, drawerProps.width (or the expanded width)
          // from lg.
          // The width mid-drag (--drawer-drag-width, set by
          // DrawerResizeHandle) wins over the state's.
          'w-full lg:w-[var(--drawer-drag-width,var(--drawer-width,800px))]',
          // A dragged width never reaches under the sidebar, also after the
          // window narrows.
          resizable &&
            'lg:max-w-[calc(100%-var(--layout-sidebar-width,0px))] data-[resizing]:transition-none data-[resizing]:select-none',
          floating
            ? [
                // A panel hanging from the header (and the impersonation bar),
                // flush with it and the right edge so no page content shows
                // between them; from lg a rounded bottom-left corner and a
                // shadow lift it off the page.
                'overflow-hidden transition-[width] duration-300 ease-[ease]',
                'top-[calc(var(--layout-page-bar-height,0px)+var(--layout-header-height,55px))] h-[calc(100vh-var(--layout-page-bar-height,0px)-var(--layout-header-height,55px))] max-w-full',
                'lg:rounded-bl-modal',
                'lg:shadow-[var(--drawer-floating-shadow)]',
                // Under header dropdowns (z-index 105) for the chats; the
                // confirmation drawer stays at the drawer layer.
                chat ? 'z-[100]' : 'z-mobile-drawer',
              ]
            : 'top-0 bottom-0 overflow-auto z-mobile-drawer data-[state=open]:shadow-[var(--drawer-shadow)]',
          // Sign-in pages render neither the app header nor the page bar:
          // tuck the assistant under the sign-in strip, whose 40px controls
          // plus the layouts' 1rem padding end at 56px.
          shell === DRAWER_SHELL_CLASS.ai &&
            '[body:has([data-slot=auth-header-controls])_&]:top-[64px] [body:has([data-slot=auth-header-controls])_&]:h-[calc(100vh-64px)]',
        )}
        style={{ '--drawer-width': width } as React.CSSProperties}
        aria-describedby={undefined}
        // Clicking or focusing the page beside a docked drawer works on the
        // page; only the drawer's own close or Escape closes it.
        onInteractOutside={(event) => {
          if (docked) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isInsidePointerDown(event)) {
            event.preventDefault();
          }
          // A floating drawer leaves the header's drawer toggles live (they
          // keep pointer-events through the dialog's body lock). Their click
          // closes or switches the drawer; dismissing it here first would
          // have that same click open it again.
          const target = event.detail.originalEvent.target as Element | null;
          if (floating && target?.closest('[data-drawer-toggle]')) {
            event.preventDefault();
          }
        }}
      >
        <div
          className={classNames(
            'relative flex flex-col w-full min-w-0 wrap-break-word bg-primary dark:border dark:border-secondary',
            floating && 'h-full',
          )}
        >
          <div
            data-slot="drawer-header"
            className={classNames(
              'flex flex-wrap items-center justify-between text-sm font-bold text-secondary',
              shell === DRAWER_SHELL_CLASS.ai
                ? // The assistant has no header bar: its controls float over
                  // the top right corner of the chat.
                  'absolute top-[16px] right-[16px] z-1'
                : 'min-h-[70px] mx-[1.85rem] py-[0.5rem] border-b border-b-secondary',
            )}
          >
            <div
              className={classNames(
                shell === DRAWER_SHELL_CLASS.ai && 'hidden',
              )}
            >
              <Dialog.Title asChild>
                <h3 className="flex items-center m-[0.5rem] ml-0 font-semibold text-primary text-lg">
                  {drawerProps.title}
                </h3>
              </Dialog.Title>
              {drawerProps.subtitle && (
                <h6 className="-mt-[3px] mb-0 text-sm leading-[1.2] font-medium text-quaternary">
                  {drawerProps.subtitle}
                </h6>
              )}
            </div>

            <div
              data-slot="drawer-toolbar"
              className={classNames(
                'flex flex-wrap items-center',
                shell === DRAWER_SHELL_CLASS.ai
                  ? 'ms-auto gap-[8px]'
                  : 'my-[0.5rem] gap-[0.5rem]',
              )}
            >
              {dockable && !expanded && (
                // A floating card can dock beside the page from lg.
                <span className="hidden lg:inline-flex">
                  <BaseButton
                    iconNode={
                      dockChosen ? (
                        <PushPinSlashIcon weight="bold" />
                      ) : (
                        <PushPinIcon weight="bold" />
                      )
                    }
                    tooltip={
                      !dockChosen
                        ? translate('Dock beside the page')
                        : roomBeside
                          ? translate('Float over the page')
                          : translate(
                              'Docked: it stays open as you browse, but the window is too narrow to show the page beside it. Make the drawer narrower to see both, or click to float over the page.',
                            )
                    }
                    aria-pressed={dockChosen}
                    onClick={() => setDocked(!dockChosen)}
                    variant="tertiary-ghost"
                    tooltipSide="bottom"
                    size="md"
                    data-testid="drawer-dock-toggle"
                  />
                </span>
              )}
              {drawerProps.toolbar ? (
                React.createElement(drawerProps.toolbar, { close: onHide })
              ) : (
                <BaseButton
                  iconNode={<XIcon weight="bold" />}
                  tooltip={translate('Close')}
                  onClick={onHide}
                  tooltipSide="bottom"
                  size="sm"
                  variant="tertiary"
                />
              )}
            </div>
          </div>
          <div
            data-slot="drawer-body"
            className={classNames(
              'relative flex-auto',
              chat
                ? // The chats scroll inside themselves.
                  'flex flex-col overflow-y-hidden'
                : shell === DRAWER_SHELL_CLASS.confirmation
                  ? 'min-h-0 overflow-y-auto'
                  : 'overflow-y-scroll max-lg:overflow-y-auto',
            )}
          >
            <DirtyFormContext.Provider
              value={{ setIsDirty: setIsDirtyContext }}
            >
              <div
                className={
                  chat
                    ? 'flex flex-1 flex-col min-h-0 pt-[0.75rem]'
                    : (drawerProps.bodyClassName ?? 'p-[1.846rem]')
                }
              >
                <ErrorBoundary fallback={ErrorMessage}>
                  {drawerComponent
                    ? React.createElement(drawerComponent, {
                        ...drawerProps,
                        close: onHide,
                      })
                    : null}
                </ErrorBoundary>
              </div>
            </DirtyFormContext.Provider>
          </div>
          {drawerProps.footer && (
            <div
              data-slot="drawer-footer"
              className="py-[1.25rem] px-[1.85rem] text-center border-t border-t-secondary"
            >
              <drawerProps.footer {...drawerProps} close={onHide} />
            </div>
          )}
        </div>
        {/* After the contents, so the dialog's initial focus lands on them. */}
        {resizable && <DrawerResizeHandle panel={panel} docked={docked} />}
      </Dialog.Content>
    </Dialog.Root>
  );
};
