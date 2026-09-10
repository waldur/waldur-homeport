import { TrashIcon } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
    /**
     * Both labels come from `ConfirmationOptions`, which `confirm` spreads into
     * `resolve`. They used to be dropped here while `ConfirmationDialog`
     * honoured them, so every `forDeletion` caller got "Delete" -- including
     * "Purge queue", which is a different operation, and the OpenStack actions
     * that remove an interface from a router rather than delete the router.
     */
    positiveButton?: string;
    negativeButton?: string;
  };
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({
  resolve: { title, body, deferred, iconNode, positiveButton, negativeButton },
}) => {
  const { closeDialog: closeModal } = useModal();
  const closeDialog = () => closeModal('HIDE_CONFIRM');

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
          <CloseDialogButton
            label={negativeButton}
            className="min-w-150px"
            onClick={handleCancel}
          />
          <SubmitButton
            submitting={false}
            variant="danger"
            className="min-w-150px"
            onClick={handleSubmit}
            type="button"
            label={positiveButton || translate('Delete')}
          />
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
