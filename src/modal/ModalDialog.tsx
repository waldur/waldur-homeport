import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

import { RadarIcon } from '@waldur/core/RadarIcon';
import { RadialBg } from '@waldur/navigation/header/search/RadialBg';

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
  hasHeaderPadding?: boolean;
  hasFooterPadding?: boolean;
  hasFooterBorder?: boolean;
  children?: ReactNode;
  headerLess?: boolean;
  actions?: ReactNode;
  /** Extra node will be placed between header and body of the modal */
  extra?: ReactNode;
  extraClassName?: string;
  onHide?(): void;
}

export const ModalDialog: FC<ModalDialogProps> = ({
  closeButton = false,
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
  hasHeaderPadding,
  hasFooterPadding,
  hasFooterBorder,
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
          !hasHeaderPadding && 'pb-0',
          !title && 'without-border',
          iconNode && 'has-icon',
        )}
      >
        <div className="flex-grow-1">
          {Boolean(iconNode) && (
            <>
              <RadialBg className="icon-background" />
              <RadarIcon
                IconComponent={iconNode}
                variant={iconColor}
                solid
                size="lg"
                className="modal-icon mb-6"
              />
            </>
          )}
          <Modal.Title className="fw-bold">{title}</Modal.Title>
          {subtitle && (
            <h6 className="text-gray-500 fw-normal mt-2 lh-base">{subtitle}</h6>
          )}
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
        className={classNames(
          footerClassName,
          !hasFooterPadding && !hasFooterBorder && 'pt-0',
          !hasFooterBorder && 'border-0',
          'gap-2',
        )}
      >
        {footer}
      </Modal.Footer>
    )}
  </div>
);
