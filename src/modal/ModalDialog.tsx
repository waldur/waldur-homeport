import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { RadialBg } from '@/navigation/header/search/RadialBg';

interface ModalDialogProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  iconNode?: ReactNode;
  iconColor?: string;
  footer?: ReactNode;
  closeButton?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  headerLess?: boolean;
  actions?: ReactNode;
  /** Extra node will be placed between header and body of the modal */
  extra?: ReactNode;
  extraClassName?: string;
  onHide?(): void;
}

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
      <Modal.Header
        closeButton={closeButton}
        onHide={onHide}
        className={classNames(
          headerClassName,
          'without-border',
          !title && 'without-border',
          iconNode && 'has-icon',
        )}
      >
        <div className="flex-grow-1">
          {Boolean(iconNode) && (
            <>
              <RadialBg className="icon-background" />
              <FeaturedIcon
                IconComponent={iconNode}
                variant={iconColor}
                solid
                size="lg"
                className="modal-icon mb-6"
              />
            </>
          )}
          <Modal.Title className="fw-bold" as="h3">
            {title}
          </Modal.Title>
          {subtitle && <h6 className="modal-subtitle">{subtitle}</h6>}
        </div>
        {actions}
      </Modal.Header>
    )}
    {Boolean(extra) && (
      <Modal.Header className={classNames('without-border', extraClassName)}>
        {extra}
      </Modal.Header>
    )}
    <Modal.Body className={classNames(bodyClassName, 'border-0')}>
      {children}
    </Modal.Body>
    {footer && (
      <Modal.Footer
        className={classNames(footerClassName, 'border-0')}
        data-testid="modal-footer"
      >
        {footer}
      </Modal.Footer>
    )}
  </div>
);
