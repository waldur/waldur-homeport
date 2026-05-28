import { AccessSubnet, accessSubnetsDestroy } from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface AccessSubnetDeleteButtonProps {
  row: AccessSubnet;
  refetch;
}

export const AccessSubnetDeleteButton = (
  props: AccessSubnetDeleteButtonProps,
) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => accessSubnetsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {inet} access subnet?',
        { inet: <strong>{props.row.inet}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Access subnet has been removed.'),
    errorMessage: translate('Unable to remove access subnet.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
