import { OrganizationGroup, organizationGroupsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface OrganizationGroupDeleteButtonProps {
  row: OrganizationGroup;
  refetch;
}

export const OrganizationGroupDeleteButton = (
  props: OrganizationGroupDeleteButtonProps,
) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      organizationGroupsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {name} organization group?',
        { name: <strong>{props.row.name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove organization group.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
