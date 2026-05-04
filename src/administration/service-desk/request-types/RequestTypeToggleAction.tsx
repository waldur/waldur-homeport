import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import {
  RequestTypeAdmin,
  supportRequestTypesAdminActivate,
  supportRequestTypesAdminDeactivate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const RequestTypeToggleAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const toggleMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      row.is_active
        ? supportRequestTypesAdminDeactivate({ path: { uuid: row.uuid } })
        : supportRequestTypesAdminActivate({ path: { uuid: row.uuid } }),
    successMessage: row.is_active
      ? translate('Request type has been deactivated.')
      : translate('Request type has been activated.'),
    errorMessage: row.is_active
      ? translate('Unable to deactivate request type.')
      : translate('Unable to activate request type.'),
    refetch,
  });

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
      action={() => toggleMutation.mutate()}
    />
  );
};
