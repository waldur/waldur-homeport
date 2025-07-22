import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingUsagePoliciesCreate } from 'waldur-js-client';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { PolicyPeriod } from '@waldur/customer/cost-policies/types';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

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
  const dispatch = useDispatch();
  const openPolicyCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(PolicyCreateDialog, {
          size: 'lg',
          submitFn: async (formData: OfferingUsagePolicyFormData) => {
            try {
              await marketplaceOfferingUsagePoliciesCreate({ body: formData });
              dispatch(closeModalDialog());
              refetch();
            } catch (e: any) {
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
            component_limits_set: [],
          },
          type: 'usage',
          offering,
        }),
      ),
    [dispatch, offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
