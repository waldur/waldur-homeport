import {
  marketplaceOfferingGroupsDestroy,
  OfferingGroup,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface OfferingGroupDeleteButtonProps {
  row: OfferingGroup;
  refetch: () => void;
}

export const OfferingGroupDeleteButton = (
  props: OfferingGroupDeleteButtonProps,
) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingGroupsDestroy({ path: { uuid: props.row.uuid! } }),
    refetch: props.refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the {name} offering group? Offerings assigned to this group will be detached.',
        { name: <strong>{props.row.title}</strong> },
        formatJsxTemplate,
      ),
      options: {
        forDeletion: true,
      },
    },
    errorMessage: translate('Unable to remove offering group.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
