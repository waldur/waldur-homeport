import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ConfirmationDialogProps {
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

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: { title, body, nb, deferred },
}) => {
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
    <ModalDialog
      title={title}
      footer={
        <>
          <Button onClick={handleSubmit}>{translate('Yes')}</Button>
          <Button variant="danger" onClick={handleCancel}>
            {translate('No')}
          </Button>
        </>
      }
    >
      {body}
      <br />
      {nb && <small className="text-danger">{nb}</small>}
    </ModalDialog>
  );
};
