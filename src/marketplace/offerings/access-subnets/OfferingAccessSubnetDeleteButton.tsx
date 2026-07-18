import {
  OfferingAccessSubnet,
  marketplaceOfferingAccessSubnetsDestroy,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface OfferingAccessSubnetDeleteButtonProps {
  row: OfferingAccessSubnet;
  refetch;
}

export const OfferingAccessSubnetDeleteButton = (
  props: OfferingAccessSubnetDeleteButtonProps,
) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingAccessSubnetsDestroy({
        path: { uuid: props.row.uuid },
      }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {inet} default subnet?',
        { inet: <strong>{props.row.inet}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Default access subnet has been removed.'),
    errorMessage: translate('Unable to remove default access subnet.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
