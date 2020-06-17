import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
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
    title: string;
    body: string;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: { title, body, deferred },
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
          <Button bsStyle="danger" onClick={handleSubmit}>
            {translate('Yes')}
          </Button>
          <Button onClick={handleCancel}>{translate('No')}</Button>
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
