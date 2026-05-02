import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import {
  adminArrowCustomerMappingsSyncFromArrow,
  type ArrowCustomerMapping,
  type SyncFromArrowRequestRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { arrowQueryKeys } from '../api';

export const CustomerMappingSyncAction = ({
  row,
  refetch,
}: {
  row: ArrowCustomerMapping;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<
    any,
    any,
    SyncFromArrowRequestRequest
  >({
    mutationFn: (data?) =>
      adminArrowCustomerMappingsSyncFromArrow({ body: data }),

    successMessage: translate('Sync from Arrow triggered'),
    errorMessage: translate('Failed to trigger sync'),
    refetch,

    invalidateQueries: [
      {
        queryKey: arrowQueryKeys.customerMappings(),
      },
    ],
  });

  return (
    <ActionItem
      action={() => mutate({ settings_uuid: row.settings_uuid })}
      title={translate('Sync from Arrow')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
