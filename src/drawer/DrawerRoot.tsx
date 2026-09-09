import { XIcon } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { FunctionComponent, useContext } from 'react';

import { CompactIconButton } from '@/core/buttons/IconButton';
import { DirtyFormContext } from '@/core/DirtyFormContext';
import { ErrorMessage } from '@/ErrorMessage';
import { translate } from '@/i18n';

import { DrawerContext } from './DrawerContext';

export const DrawerRoot: FunctionComponent = () => {
  const context = useContext(DrawerContext);

  if (!context) {
    return null;
  }

  const { isOpen, drawerComponent, drawerProps, closeDrawer } = context;
  const [isDirtyContext, setIsDirtyContext] = React.useState(false);
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

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onHide();
      }}
    >
      {isOpen && <Dialog.Overlay className="drawer-overlay" />}
      {/*
        No forceMount: Dialog.Content's own Presence (gated on the Root's
        `open`) keeps #kt_drawer mounted through the close animation on its
        own, as long as an actual @keyframes animation-name changes between
        the .drawer-on and non-.drawer-on states (see the #kt_drawer rules in
        _shell.scss) — Presence detects animations, not CSS transitions.
        forceMount was tried first and reverted: it keeps the Radix
        DismissableLayer's global pointerdown/focus listeners permanently
        registered even while closed, which broke real (trusted) clicks on
        the header's Support/Pending-tasks toggle buttons elsewhere on the
        page — untrusted/synthetic clicks and every other manual DOM check
        looked fine, which is why it wasn't caught until real click testing.
      */}
      <Dialog.Content
        id="kt_drawer"
        className={classNames('bg-body drawer drawer-end', {
          'drawer-on': isOpen,
        })}
        style={{ '--drawer-width': drawerProps.width } as React.CSSProperties}
        aria-describedby={undefined}
      >
        <div className="card shadow-none rounded-0 w-100">
          <div className="card-header" id="kt_drawer_header">
            <div>
              <Dialog.Title asChild>
                <h3 className="card-title fw-bolder text-dark fs-3">
                  {drawerProps.title}
                </h3>
              </Dialog.Title>
              {drawerProps.subtitle && (
                <h6 className="text-muted card-subtitle fw-bold">
                  {drawerProps.subtitle}
                </h6>
              )}
            </div>

            <div className="card-toolbar gap-2">
              {drawerProps.toolbar ? (
                React.createElement(drawerProps.toolbar, { close: onHide })
              ) : (
                <CompactIconButton
                  iconNode={<XIcon weight="bold" />}
                  tooltip={translate('Close')}
                  onClick={onHide}
                  tooltipPlacement="bottom"
                />
              )}
            </div>
          </div>
          <div className="card-body scroll-y p-0" id="kt_drawer_body">
            <DirtyFormContext.Provider
              value={{ setIsDirty: setIsDirtyContext }}
            >
              <div className={drawerProps.bodyClassName ?? 'p-8'}>
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
            <div className="card-footer py-5 text-center" id="kt_drawer_footer">
              <drawerProps.footer {...drawerProps} close={onHide} />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
