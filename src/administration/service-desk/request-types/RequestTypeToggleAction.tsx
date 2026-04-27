import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import {
  RequestTypeAdmin,
  RequestTypeAdminRequest,
  supportRequestTypesAdminActivate,
  supportRequestTypesAdminDeactivate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/hooks';

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
        await supportRequestTypesAdminDeactivate({
          path: { uuid: row.uuid },
          body: {} as RequestTypeAdminRequest,
        });
        showSuccess(translate('Request type has been deactivated.'));
      } else {
        await supportRequestTypesAdminActivate({
          path: { uuid: row.uuid },
          body: {} as RequestTypeAdminRequest,
        });
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
      iconNode={
        row.is_active ? (
          <XCircleIcon weight="bold" />
        ) : (
          <CheckCircleIcon weight="bold" />
        )
      }
      action={handleToggle}
    />
  );
};
