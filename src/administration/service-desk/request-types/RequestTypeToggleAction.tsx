import { CheckCircle, XCircle } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useNotify } from '@waldur/store/hooks';

import {
  activateRequestType,
  deactivateRequestType,
  RequestTypeAdmin,
} from './api';

export const RequestTypeToggleAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const { showSuccess, showErrorResponse } = useNotify();

  const handleToggle = async () => {
    try {
      if (row.is_active) {
        await deactivateRequestType(row.uuid);
        showSuccess(translate('Request type has been deactivated.'));
      } else {
        await activateRequestType(row.uuid);
        showSuccess(translate('Request type has been activated.'));
      }
      refetch();
    } catch (error) {
      showErrorResponse(
        error,
        row.is_active
          ? translate('Unable to deactivate request type.')
          : translate('Unable to activate request type.'),
      );
    }
  };

  return (
    <ActionItem
      title={row.is_active ? translate('Deactivate') : translate('Activate')}
      iconNode={row.is_active ? <XCircle /> : <CheckCircle />}
      action={handleToggle}
    />
  );
};
