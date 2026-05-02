import { useCallback, FunctionComponent } from 'react';
import { useAsync } from 'react-use';
import { userGroupInvitationsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

import { GroupInvitationButtons } from './GroupinvitationButtons';
import { GroupInvitationErrorMessage } from './GroupInvitationErrorMessage';
import { GroupInvitationMessage } from './GroupInvitationMessage';

export const GroupInvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const { closeDialog } = useModal();

  const dismiss = useCallback(() => {
    deferred.reject();
    closeDialog();
  }, [closeDialog, deferred]);

  const submitRequest = useCallback(() => {
    closeDialog();
    deferred.resolve(true);
  }, [closeDialog, deferred]);

  const asyncResult = useAsync(() =>
    userGroupInvitationsRetrieve({ path: { uuid: token } }).then(
      (response) => response.data,
    ),
  );

  const invitation = asyncResult.value;

  return (
    <ModalDialog
      title={
        invitation?.is_public
          ? translate('Join organization')
          : translate('Request permission')
      }
      footer={
        !asyncResult.loading &&
        !asyncResult.error && (
          <GroupInvitationButtons
            dismiss={dismiss}
            submitRequest={submitRequest}
          />
        )
      }
    >
      {asyncResult.loading && (
        <>
          <LoadingSpinner />
          <p className="text-center">
            {translate('Please give us a moment to validate your invitation.')}
          </p>
        </>
      )}
      {!asyncResult.loading &&
        (asyncResult.error ? (
          <GroupInvitationErrorMessage dismiss={dismiss} />
        ) : (
          <GroupInvitationMessage invitation={invitation} />
        ))}
    </ModalDialog>
  );
};
