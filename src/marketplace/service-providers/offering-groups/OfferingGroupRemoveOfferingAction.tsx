import { ProviderOffering } from 'waldur-js-client';
import { marketplaceProviderOfferingsSetOfferingGroup } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

interface OfferingGroupRemoveOfferingActionProps {
  row: ProviderOffering;
  refetch: () => void;
}

export const OfferingGroupRemoveOfferingAction = ({
  row,
  refetch,
}: OfferingGroupRemoveOfferingActionProps) => {
  const user = useUser();
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsSetOfferingGroup({
        path: { uuid: row.uuid! },
        body: { offering_group: null },
      }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Remove {name} from this offering group? The offering itself is not changed.',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
    },
    successMessage: translate('Offering has been removed from the group.'),
    errorMessage: translate('Unable to remove the offering from the group.'),
  });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <RemovalActionItem
      title={translate('Remove from group')}
      action={mutate}
      disabled={isPending}
    />
  );
};
