import { WarningCircle } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import { MetronicModalDialog } from './MetronicModalDialog';

interface DeleteConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: () => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    nb?: ReactNode;
  };
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ resolve: { title, body, nb, deferred } }) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog());

  const handleSubmit = () => {
    deferred.resolve();
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <MetronicModalDialog
      title={title}
      iconNode={<WarningCircle weight="bold" />}
      iconColor="danger"
      bodyClassName="text-grey-500"
      footer={
        <>
          <Button
            variant="outline btn-outline-default"
            className="flex-equal"
            onClick={handleCancel}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-equal"
            onClick={handleSubmit}
          >
            {translate('Delete')}
          </Button>
        </>
      }
    >
      {body}
      <br />
      {nb && <small className="text-danger">{nb}</small>}
    </MetronicModalDialog>
  );
};
