import { ToggleLeftIcon, ToggleRightIcon } from '@phosphor-icons/react';
import {
  adminArrowVendorOfferingMappingsPartialUpdate,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const VendorOfferingMappingToggleActiveAction = ({
  row,
  refetch,
}: {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      adminArrowVendorOfferingMappingsPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_active: !row.is_active },
      }),
    successMessage: translate('Mapping status updated.'),
    errorMessage: translate('Unable to update mapping status.'),
    refetch,
  });

  return (
    <ActionItem
      title={row.is_active ? translate('Deactivate') : translate('Activate')}
      action={mutate}
      iconNode={
        row.is_active ? (
          <ToggleLeftIcon weight="bold" />
        ) : (
          <ToggleRightIcon weight="bold" />
        )
      }
      disabled={isPending}
    />
  );
};
