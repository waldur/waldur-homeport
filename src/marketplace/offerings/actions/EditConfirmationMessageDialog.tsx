import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering } from '@waldur/marketplace/common/api';
import { EditConfirmationMessageForm } from '@waldur/marketplace/offerings/actions/EditConfirmationMessageForm';

interface EditConfirmationMessageDialogProps {
  resolve: { offeringUuid: string };
}

export const EditConfirmationMessageDialog: FunctionComponent<EditConfirmationMessageDialogProps> =
  ({ resolve }) => {
    const {
      loading,
      error,
      value: offering,
    } = useAsync(
      async () => await getOffering(resolve.offeringUuid),
      [resolve.offeringUuid],
    );
    return loading ? (
      <LoadingSpinner />
    ) : error ? (
      <>{translate('Unable to load offering.')}</>
    ) : (
      <EditConfirmationMessageForm offering={offering} />
    );
  };
