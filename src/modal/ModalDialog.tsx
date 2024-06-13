import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

interface ModalDialogProps {
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  closeButton?: boolean;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
}

export const ModalDialog: FC<ModalDialogProps> = ({
  closeButton = false,
  title,
  subtitle,
  children,
  footer,
  bodyClassName,
  headerClassName,
  footerClassName,
}) => (
  <div>
    <Modal.Header
      closeButton={closeButton}
      className={classNames(headerClassName, !title && 'without-border')}
    >
      <div>
        <Modal.Title>{title}</Modal.Title>
        {subtitle && <h6 className="text-gray-700 fw-bold mt-1">{subtitle}</h6>}
      </div>
    </Modal.Header>
    <Modal.Body className={bodyClassName}>{children}</Modal.Body>
    {footer && (
      <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
    )}
  </div>
);
