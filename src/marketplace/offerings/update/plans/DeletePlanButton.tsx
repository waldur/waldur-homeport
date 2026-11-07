import { FunctionComponent } from 'react';
import { marketplacePlansDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useOpenOfferingChange } from '@/marketplace/offerings/dependents/useOpenOfferingChange';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeletePlanButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const openChange = useOpenOfferingChange();
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() =>
        openChange({
          title: translate('Delete plan {name}?', { name: plan.name }),
          body: translate('Are you sure you would like to delete the plan?'),
          change: 'plan_deleted',
          offeringUuid: offering.uuid,
          planUuid: plan.uuid,
          confirmLabel: translate('Delete'),
          forDeletion: true,
          mutationFn: () =>
            marketplacePlansDestroy({ path: { uuid: plan.uuid } }),
          successMessage: translate('Plan has been deleted.'),
          errorMessage: translate('Unable to delete plan.'),
          onSuccess: refetch,
        })
      }
      staff
    />
  );
};
