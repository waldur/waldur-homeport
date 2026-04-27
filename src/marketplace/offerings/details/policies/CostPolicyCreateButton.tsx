import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingEstimatedCostPoliciesCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { PolicyPeriod } from '@/customer/cost-policies/types';
import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { closeModalDialog, openModalDialog } from '@/modal/actions';
import { showErrorResponse } from '@/store/notify';

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
  const dispatch = useDispatch();
  const openPolicyCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(PolicyCreateDialog, {
          size: 'lg',
          submitFn: async (formData: OfferingCostPolicyFormData) => {
            try {
              await marketplaceOfferingEstimatedCostPoliciesCreate({
                body: formData,
              });
              dispatch(closeModalDialog());
              refetch();
            } catch (e) {
              dispatch(
                showErrorResponse(e, translate('Unable to create policy.')),
              );
              if (e.response && e.response.status === 400) {
                return e.response.data;
              }
              return { [FORM_ERROR]: translate('Unable to create policy.') };
            }
          },
          initialValues: {
            scope: offering.url,
            period: policyPeriodOptions.oneMonth.value as PolicyPeriod,
          },
          type: 'cost',
          offering,
        }),
      ),
    [dispatch, offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
