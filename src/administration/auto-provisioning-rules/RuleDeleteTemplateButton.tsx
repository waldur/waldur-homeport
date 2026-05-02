import { autoprovisioningRulesPartialUpdate } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RuleDeleteTemplateButton = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      autoprovisioningRulesPartialUpdate({
        path: { uuid: row.uuid },
        body: {
          plan_attributes: {},
          plan_limits: {},
          plan: null,
          project_role_name: row.project_role_display_name,
        },
      }),
    successMessage: translate('Template removed'),
    errorMessage: translate('Unable to remove template.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove the template of rule {name}?',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove template')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
