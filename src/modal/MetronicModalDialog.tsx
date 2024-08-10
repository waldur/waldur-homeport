import classNames from 'classnames';
import { FC } from 'react';

import { ModalDialog, ModalDialogProps } from './ModalDialog';

export const MetronicModalDialog: FC<ModalDialogProps> = ({
  bodyClassName,
  headerClassName,
  footerClassName,
  ...props
}) => (
  <ModalDialog
    headerClassName={classNames(headerClassName, 'without-border pb-0')}
    bodyClassName={classNames(bodyClassName, 'border-0')}
    footerClassName={classNames(footerClassName, 'border-0 pt-0 gap-2')}
    {...props}
  />
);
