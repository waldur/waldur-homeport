import { FunctionComponent } from 'react';
import { marketplacePlansDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeletePlanButton: FunctionComponent<{ plan; refetch }> = ({
  plan,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplacePlansDestroy({
        path: { uuid: plan.uuid },
      }),
    successMessage: translate('Plan has been deleted.'),
    errorMessage: translate('Unable to delete plan.'),
    refetch,
    confirmation: {
      title: translate('Delete plan {name}?', {
        name: plan.name,
      }),
      body: translate('Are you sure you would like to delete the plan?'),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      staff
    />
  );
};
