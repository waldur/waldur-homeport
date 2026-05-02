import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import { marketplaceOfferingUsagePoliciesCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { PolicyPeriod } from '@/customer/cost-policies/types';
import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { OfferingUsagePolicyFormData } from './types';

const PolicyCreateDialog = lazyComponent(() =>
  import('./PolicyCreateDialog').then((module) => ({
    default: module.PolicyCreateDialog,
  })),
);

interface UsagePolicyCreateButtonProps {
  offering: Offering;
  refetch(): void;
}

export const UsagePolicyCreateButton = ({
  offering,
  refetch,
}: UsagePolicyCreateButtonProps) => {
  const { showErrorResponse } = useNotify();

  const { openDialog, closeDialog } = useModal();

  const openPolicyCreateDialog = useCallback(
    () =>
      openDialog(PolicyCreateDialog, {
        size: 'lg',
        submitFn: async (formData: OfferingUsagePolicyFormData) => {
          try {
            await marketplaceOfferingUsagePoliciesCreate({ body: formData });
            closeDialog();
            refetch();
          } catch (e: any) {
            showErrorResponse(e, translate('Unable to create policy.'));
            if (e.response && e.response.status === 400) {
              return e.response.data;
            }
            return { [FORM_ERROR]: translate('Unable to create policy.') };
          }
        },
        initialValues: {
          scope: offering.url,
          period: policyPeriodOptions.oneMonth.value as PolicyPeriod,
          component_limits_set: [],
        },
        type: 'usage',
        offering,
      }),
    [offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
