import { supportTemplatesDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const IssueTemplateDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => supportTemplatesDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate('Are you sure you want to delete the issue template?'),

      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
