import { TrashIcon } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import { ModalDialog } from './ModalDialog';

interface DeleteConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: () => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    iconNode?: ReactNode;
  };
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ resolve: { title, body, deferred, iconNode } }) => {
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
      iconNode={iconNode || <TrashIcon weight="bold" />}
      iconColor="danger"
      bodyClassName="text-quaternary pt-8px"
      footer={
        <>
          <Button
            variant="tertiary"
            className="min-w-150px"
            onClick={handleCancel}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="danger"
            className="min-w-150px"
            onClick={handleSubmit}
          >
            {translate('Delete')}
          </Button>
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
