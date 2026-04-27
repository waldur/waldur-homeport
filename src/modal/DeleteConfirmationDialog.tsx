import { TrashIcon } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

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
          <CloseDialogButton className="min-w-150px" onClick={handleCancel} />
          <SubmitButton
            submitting={false}
            variant="danger"
            className="min-w-150px"
            onClick={handleSubmit}
            type="button"
            label={translate('Delete')}
          />
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
