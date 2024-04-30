import { FC, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

interface ModalDialogProps {
  title: ReactNode;
  footer?: ReactNode;
  closeButton?: boolean;
  bodyClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
}

export const ModalDialog: FC<ModalDialogProps> = ({
  closeButton = false,
  title,
  children,
  footer,
  bodyClassName,
  footerClassName,
}) => (
  <div>
    <Modal.Header
      closeButton={closeButton}
      className={!title ? 'without-border' : undefined}
    >
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className={bodyClassName}>{children}</Modal.Body>
    {footer && (
      <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
    )}
  </div>
);
