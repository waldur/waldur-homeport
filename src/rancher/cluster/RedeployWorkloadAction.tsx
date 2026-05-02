import { SwapIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { rancherWorkloadsRedeploy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface RedeployWorkloadActionProps {
  workload: any;
  disabled?: boolean;
}

export const RedeployWorkloadAction: FC<RedeployWorkloadActionProps> = ({
  workload,
  disabled,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      rancherWorkloadsRedeploy({ path: { uuid: workload.uuid } }),
    successMessage: translate('Workload has been redeployed.'),
    errorMessage: translate('Unable to redeploy workload.'),
    confirmation: {
      title: translate('Redeploy workload'),
      body: translate(
        'Are you sure you want to redeploy workload {workload}?',
        { workload: <strong>{workload.name}</strong> },
        formatJsxTemplate,
      ),
      options: {
        positiveButton: translate('Redeploy'),
        negativeButton: translate('Cancel'),
        iconNode: <SwapIcon weight="bold" />,
      },
    },
  });

  return (
    <ActionItem
      title={translate('Redeploy')}
      action={mutate}
      iconNode={<SwapIcon weight="bold" />}
      disabled={disabled || isPending}
    />
  );
};
