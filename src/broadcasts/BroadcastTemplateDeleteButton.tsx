import { broadcastMessageTemplatesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const BroadcastTemplateDeleteButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      broadcastMessageTemplatesDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the template {template_name}?',
        { template_name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),

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
