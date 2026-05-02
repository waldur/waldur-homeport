import { marketplaceTagsDestroy, Tag } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface TagDeleteButtonProps {
  row: Tag;
  refetch: () => void;
}

export const TagDeleteButton = (props: TagDeleteButtonProps) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      marketplaceTagsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {name} tag?',
        { name: <strong>{props.row.name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove tag.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
