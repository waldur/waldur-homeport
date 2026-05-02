import {
  marketplaceCustomerServiceAccountsDestroy,
  marketplaceProjectServiceAccountsDestroy,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ServiceAccountDeleteAction = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      if ('project' in row) {
        await marketplaceProjectServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      } else {
        await marketplaceCustomerServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      }
    },
    successMessage: translate('Service account has been deleted.'),
    errorMessage: translate('Unable to delete service account.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the {name} service account?',
        { name: <strong>{row.name || row.username || row.uuid}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      action={() => deleteMutation.mutate()}
      title={translate('Delete')}
      disabled={deleteMutation.isPending}
    />
  );
};
