import { XIcon } from '@phosphor-icons/react';
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

import { DrawerContext } from './DrawerContext';
import { DrawerResizeHandle } from './DrawerResizeHandle';
import { DRAWER_WIDE_WIDTH } from './drawerWidth';
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
  const width = expanded
    ? 'calc(100% - var(--layout-sidebar-width, 0px))'
    : draggedWidth !== null
      ? `${draggedWidth}px`
      : drawerProps.width;
  const resizable = Boolean(drawerProps.resizable);
  const isDesktop = useBreakpointUp('lg');
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

  const shell = drawerProps.shellClass as DrawerShellClass | undefined;
  const floating = Boolean(shell);
  const chat =
    shell === DRAWER_SHELL_CLASS.ai || shell === DRAWER_SHELL_CLASS.support;

  return (
    <Dialog.Root
      open={isOpen}
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
        {resizable && <DrawerResizeHandle panel={panel} />}
      </Dialog.Content>
    </Dialog.Root>
  );
};
