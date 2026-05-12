import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import {
  marketplaceOfferingEstimatedCostPoliciesCreate,
  PolicyPeriodEnum,
} from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { OfferingCostPolicyFormData } from './types';

const PolicyCreateDialog = lazyComponent(() =>
  import('./PolicyCreateDialog').then((module) => ({
    default: module.PolicyCreateDialog,
  })),
);

interface CostPolicyCreateButtonProps {
  offering: Offering;
  refetch(): void;
}

export const CostPolicyCreateButton = ({
  offering,
  refetch,
}: CostPolicyCreateButtonProps) => {
  const { showErrorResponse } = useNotify();

  const { openDialog, closeDialog } = useModal();

  const openPolicyCreateDialog = useCallback(
    () =>
      openDialog(PolicyCreateDialog, {
        size: 'lg',
        submitFn: async (formData: OfferingCostPolicyFormData) => {
          try {
            await marketplaceOfferingEstimatedCostPoliciesCreate({
              body: formData,
            });
            closeDialog();
            refetch();
          } catch (e) {
            showErrorResponse(e, translate('Unable to create policy.'));
            if (e.response && e.response.status === 400) {
              return e.response.data;
            }
            return { [FORM_ERROR]: translate('Unable to create policy.') };
          }
        },
        initialValues: {
          scope: offering.url,
          period: policyPeriodOptions.oneMonth.value as PolicyPeriodEnum,
        },
        type: 'cost',
        offering,
      }),
    [offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
