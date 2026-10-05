import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import React, { createContext, FC, ReactNode, useRef } from 'react';
import BootstrapModalContext from 'react-bootstrap/ModalContext';

import { useFocusThroughRemovals } from '@/core/useFocusThroughRemovals';
import { useInsidePointerDown } from '@/core/useInsidePointerDown';

import { DialogSizeType } from './types';

import './ModalRoot.css';

export interface ModalShellProps {
  open: boolean;
  onHide: () => void;
  /** The dialog's accessible name, when it is not its visible title. */
  title?: ReactNode;
  size?: DialogSizeType;
  centered?: boolean;
  scrollable?: boolean;
  className?: string;
  dialogClassName?: string;
  backdropClassName?: string;
  modalStyle?: React.CSSProperties;
  keyboard?: boolean;
  backdrop?: boolean | 'static';
  animation?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
  children: ReactNode;
}

/**
 * Tells ModalDialog it sits in a ModalShell, and whether the shell already
 * names the dialog (a string `title`); if not, ModalDialog's visible title
 * names it (Dialog.Title).
 */
export const ModalShellContext = createContext<{ named: boolean } | null>(null);

/**
 * A modal Radix Dialog with Bootstrap's modal markup and CSS (.modal,
 * .modal-dialog, .modal-content), in Radix's "scrollable overlay" shape: the
 * overlay is the scrolling .modal, the content is the .modal-dialog box.
 *
 * Radix does the modal work: it traps focus (Tab wraps), hides the rest of
 * the page from assistive technology, locks its scroll, closes on Escape or
 * a click outside the box, and stacks dialogs (ConfirmModalRoot over
 * ModalRoot). Selects, menus, popovers and date pickers rendered inside count
 * as inside wherever they are portaled, as Radix follows the React tree; the
 * selects re-enable the pointer events Radix turns off on <body>
 * (useSelect.ts's defaultPortalingProps), and useFocusThroughRemovals keeps
 * the trap from swallowing a Tab out of one. Content portaled in from
 * another React tree opts in with `data-dialog-inside`.
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
  backdropClassName,
  modalStyle,
  keyboard = true,
  backdrop = true,
  animation = true,
  onCloseAutoFocus,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInsidePointerDown = useInsidePointerDown(contentRef);
  useFocusThroughRemovals(contentRef, open);
  const noAnim = animation === false;
  const named = typeof title === 'string' && title !== '';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onHide();
      }}
    >
      <Dialog.Portal>
        {backdrop !== false && (
          <div
            className={classNames(
              'modal-backdrop fade show',
              noAnim && 'modal-no-animation',
              backdropClassName,
            )}
            data-state={open ? 'open' : 'closed'}
          />
        )}
        <Dialog.Overlay
          className={classNames(
            'modal fade show d-block',
            noAnim && 'modal-no-animation',
            className,
          )}
          style={modalStyle}
        >
          <Dialog.Content
            ref={contentRef}
            className={classNames(
              'modal-dialog',
              centered && 'modal-dialog-centered',
              scrollable && 'modal-dialog-scrollable',
              size && `modal-${size}`,
              dialogClassName,
            )}
            aria-describedby={undefined}
            // As Bootstrap's: only .modal-content takes the pointer, so a click
            // in the rest of the box (the full height, when centred) reaches
            // the overlay and closes the dialog. Radix would set auto here.
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
              <Dialog.Title className="visually-hidden">{title}</Dialog.Title>
            )}
            <div className="modal-content" style={{ pointerEvents: 'auto' }}>
              <ModalShellContext.Provider value={{ named }}>
                <BootstrapModalContext.Provider value={{ onHide }}>
                  {children}
                </BootstrapModalContext.Provider>
              </ModalShellContext.Provider>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
