import { useQuery } from '@tanstack/react-query';
import { useCallback, FunctionComponent } from 'react';
import { userGroupInvitationsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

import { GroupInvitationButtons } from './GroupinvitationButtons';
import { GroupInvitationErrorMessage } from './GroupInvitationErrorMessage';
import { GroupInvitationMessage } from './GroupInvitationMessage';

export const GroupInvitationConfirmDialog: FunctionComponent<{
  resolve: { token; onConfirm: () => void; onCancel: () => void };
}> = ({ resolve: { token, onConfirm, onCancel } }) => {
  const { closeDialog } = useModal();

  const dismiss = useCallback(() => {
    closeDialog();
    onCancel();
  }, [closeDialog, onCancel]);

  const submitRequest = useCallback(() => {
    closeDialog();
    onConfirm();
  }, [closeDialog, onConfirm]);

  const asyncResult = useQuery({
    queryKey: ['GroupInvitationConfirmDialog'],

    queryFn: () =>
      userGroupInvitationsRetrieve({ path: { uuid: token } }).then(
        (response) => response.data,
      ),
  });

  const invitation = asyncResult.data;

  return (
    <ModalDialog
      title={
        invitation?.is_public
          ? translate('Join organization')
          : translate('Request permission')
      }
      footer={
        !asyncResult.isLoading &&
        !asyncResult.error && (
          <GroupInvitationButtons
            dismiss={dismiss}
            submitRequest={submitRequest}
          />
        )
      }
    >
      {asyncResult.isLoading && (
        <>
          <LoadingSpinner />
          <p className="text-center">
            {translate('Please give us a moment to validate your invitation.')}
          </p>
        </>
      )}
      {!asyncResult.isLoading &&
        (asyncResult.error ? (
          <GroupInvitationErrorMessage dismiss={dismiss} />
        ) : (
          <GroupInvitationMessage invitation={invitation} />
        ))}
    </ModalDialog>
  );
};
