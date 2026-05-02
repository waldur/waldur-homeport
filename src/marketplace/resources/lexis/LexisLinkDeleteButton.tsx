import { lexisLinksDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const LexisLinkDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => lexisLinksDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('LEXIS link has been removed.'),
    errorMessage: translate('Unable to remove LEXIS link.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the LEXIS link of {resource_name}?',
        {
          resource_name: <strong>{row.resource_name}</strong>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
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
