import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

import Bg from '@waldur/navigation/header/search/Background.svg';

export interface ModalDialogProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  iconNode?: ReactNode;
  iconColor?: string;
  footer?: ReactNode;
  closeButton?: boolean;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  headerLess?: boolean;
}

export const ModalDialog: FC<ModalDialogProps> = ({
  closeButton = false,
  title,
  subtitle,
  iconNode,
  iconColor,
  children,
  footer,
  bodyClassName,
  headerClassName,
  footerClassName,
  headerLess,
}) => (
  <div>
    {!headerLess && (
      <Modal.Header
        closeButton={closeButton}
        className={classNames(
          headerClassName,
          !title && 'without-border',
          iconNode && 'has-icon',
        )}
      >
        <div>
          {Boolean(iconNode) && (
            <>
              <Bg className="icon-background" />
              <div
                className={classNames(
                  'modal-icon mb-6',
                  iconColor && `text-${iconColor}`,
                  iconColor ? `bg-light-${iconColor}` : 'bg-secondary',
                )}
              >
                {iconNode}
              </div>
            </>
          )}
          <Modal.Title className="fw-bold">{title}</Modal.Title>
          {subtitle && (
            <h6 className="text-grey-500 fw-normal mt-3">{subtitle}</h6>
          )}
        </div>
      </Modal.Header>
    )}
    <Modal.Body className={bodyClassName}>{children}</Modal.Body>
    {footer && (
      <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
    )}
  </div>
);
