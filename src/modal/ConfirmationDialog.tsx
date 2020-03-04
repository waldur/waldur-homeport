import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

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

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: { title, body, deferred },
}) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog());

  const handleSubmit = React.useCallback(() => {
    deferred.resolve();
    closeDialog();
  }, []);

  const handleCancel = React.useCallback(() => {
    deferred.reject();
    closeDialog();
  }, []);

  return (
    <ModalDialog
      title={title}
      footer={
        <>
          <Button onClick={handleSubmit}>{translate('Yes')}</Button>
          <Button onClick={handleCancel}>{translate('No')}</Button>
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};

export default connectAngularComponent(ConfirmationDialog, ['resolve']);
