import { proposalProtectedCallsResourceTemplatesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ResourceTemplateDeleteButton = ({ row, refetch, call }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsResourceTemplatesDestroy({
        path: { obj_uuid: row.uuid, uuid: call.uuid },
      }),
    successMessage: translate('Resource template deleted'),
    errorMessage: translate('Unable to delete resource template.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the resource template {name}?',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
