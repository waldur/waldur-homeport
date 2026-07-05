import { CustomerAffiliate, customerAffiliatesDestroy } from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface AffiliateLinkDeleteActionProps {
  row: CustomerAffiliate;
  refetch(): void;
}

export const AffiliateLinkDeleteAction = ({
  row,
  refetch,
}: AffiliateLinkDeleteActionProps) => {
  const deleteMutation = useManagedMutation({
    mutationFn: () => customerAffiliatesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Affiliate link has been deleted.'),
    errorMessage: translate('Unable to delete the affiliate link.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the affiliate link between {customer} and {affiliate}?',
        {
          customer: <strong>{row.customer_name}</strong>,
          affiliate: <strong>{row.affiliate_name}</strong>,
        },
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
