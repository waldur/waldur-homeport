import { marketplaceCategoryGroupsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { CategoryGroup } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface GroupDeleteButtonProps {
  row: CategoryGroup;
  refetch;
}

export const GroupDeleteButton = (props: GroupDeleteButtonProps) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      marketplaceCategoryGroupsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {title} category group?',
        { title: <strong>{props.row.title}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove category group.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
