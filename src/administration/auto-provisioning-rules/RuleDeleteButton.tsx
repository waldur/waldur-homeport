import { autoprovisioningRulesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RuleDeleteButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      autoprovisioningRulesDestroy({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the rule {name}?',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: {
        forDeletion: true,
      },
    },
    successMessage: translate('Rule deleted'),
    errorMessage: translate('Unable to delete rule.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
