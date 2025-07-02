import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import { ModalDialog } from './ModalDialog';
import { ConfirmationDialogType } from './types';

interface ConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: () => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    nb?: ReactNode;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    positiveButtonVariant?: string;
    iconNode?: ReactNode;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: {
    title,
    body,
    deferred,
    type = 'warning',
    positiveButton = translate('Yes'),
    negativeButton = translate('No'),
    positiveButtonVariant,
    iconNode,
  },
}) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog('HIDE_CONFIRM'));

  const handleSubmit = () => {
    deferred.resolve();
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <ModalDialog
      title={title}
      iconNode={iconNode || <WarningCircleIcon weight="bold" />}
      iconColor={type}
      bodyClassName="text-gray-500 pt-2"
      footer={
        <>
          <Button
            variant="outline btn-outline-default"
            className="flex-equal px-3"
            onClick={handleCancel}
          >
            {negativeButton}
          </Button>
          <Button
            variant={positiveButtonVariant}
            className="flex-equal px-3"
            onClick={handleSubmit}
          >
            {positiveButton}
          </Button>
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
