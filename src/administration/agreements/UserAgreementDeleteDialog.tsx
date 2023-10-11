import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { remove } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OwnProps {
  resolve: {
    userAgreement: {
      url: string;
      content: string;
      agreement_type: string;
    };
  };
}

const useUserAgreementDeleteDialog = (userAgreement) => {
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      setSubmitting(true);
      await remove(userAgreement.url);
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete the user agreement.'),
        ),
      );
      setSubmitting(false);
      return;
    }
    dispatch(showSuccess(translate('User agreement has been deleted.')));
    dispatch(closeModalDialog());
  }, [dispatch, userAgreement.url]);
  return {
    submitting,
    deleteUserAgreement: callback,
  };
};

export const UserAgreementDeleteDialog: FunctionComponent<OwnProps> = (
  props,
) => {
  const { submitting, deleteUserAgreement } = useUserAgreementDeleteDialog(
    props.resolve.userAgreement,
  );
  return (
    <ActionDialog
      title={translate('Delete user agreement')}
      submitLabel={translate('Submit')}
      onSubmit={deleteUserAgreement}
      submitting={submitting}
    >
      {translate('Are you sure you would like to delete the user agreement?')}
    </ActionDialog>
  );
};
